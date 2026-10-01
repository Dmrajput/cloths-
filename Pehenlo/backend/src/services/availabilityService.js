const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const BookingLock = require('../models/BookingLock');
const { BOOKING, HTTP_STATUS } = require('../utils/constants');
const {
  addDays,
  dateKeyToUtc,
  eachDateKey,
  monthRange,
  utcToDateKey,
} = require('../utils/dateUtils');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const LOCK_WAIT_MS = 4000;
const LOCK_STALE_MS = 15000;

function overlapFilter(listingId, startDate, endDate, excludeId) {
  const filter = {
    listing: listingId,
    status: { $in: BOOKING.RESERVED_STATUSES },
    startDate: { $lte: dateKeyToUtc(endDate) },
    endDate: { $gte: dateKeyToUtc(startDate) },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return filter;
}

async function expirePendingBookings(listingId) {
  try {
    const paymentService = require('./paymentService');
    await paymentService.expirePayableBookings(listingId);
  } catch (_error) {
    logger.error('payment_window_expire_failed');
  }
  const filter = {
    status: 'PENDING_OWNER_APPROVAL',
    bookingExpiresAt: { $lt: new Date() },
  };
  if (listingId) filter.listing = listingId;
  const result = await Booking.updateMany(filter, { $set: { status: 'EXPIRED' } });
  if (result.modifiedCount) {
    logger.info('booking_expired', { count: result.modifiedCount });
  }
  return result.modifiedCount || 0;
}

function blockedDateSet(listing) {
  const dates = Array.isArray(listing?.availability?.blockedDates) ? listing.availability.blockedDates : [];
  return new Set(dates.filter((value) => typeof value === 'string'));
}

function rangeHitsBlockedDate(listing, startDate, endDate) {
  const blocked = blockedDateSet(listing);
  if (!blocked.size) return false;
  return eachDateKey(startDate, endDate).some((key) => blocked.has(key));
}

async function findOverlaps(listingId, startDate, endDate, excludeId) {
  return Booking.find(overlapFilter(listingId, startDate, endDate, excludeId)).select('renter status startDate endDate');
}

function mergeRanges(ranges) {
  const sorted = ranges
    .slice()
    .sort((left, right) => (left.startDate < right.startDate ? -1 : 1));
  const merged = [];
  sorted.forEach((range) => {
    const last = merged[merged.length - 1];
    if (!last || range.startDate > addDays(last.endDate, 1)) {
      merged.push({ ...range });
      return;
    }
    if (range.endDate > last.endDate) last.endDate = range.endDate;
  });
  return merged;
}

async function getCalendar(listing, month) {
  const bounds = monthRange(month);
  if (!bounds) return null;
  await expirePendingBookings(listing._id);
  const bookings = await Booking.find({
    listing: listing._id,
    status: { $in: BOOKING.RESERVED_STATUSES },
    startDate: { $lte: dateKeyToUtc(bounds.end) },
    endDate: { $gte: dateKeyToUtc(bounds.start) },
  }).select('startDate endDate');

  const bookedRanges = mergeRanges(bookings.map((booking) => {
    const start = utcToDateKey(booking.startDate);
    const end = utcToDateKey(booking.endDate);
    return {
      startDate: start < bounds.start ? bounds.start : start,
      endDate: end > bounds.end ? bounds.end : end,
    };
  }));

  const blockedDates = [...blockedDateSet(listing)]
    .filter((key) => key >= bounds.start && key <= bounds.end)
    .sort();

  return { blockedDates, bookedRanges };
}

async function describeAvailability(listing, startDate, endDate, viewerId) {
  if (rangeHitsBlockedDate(listing, startDate, endDate)) {
    return { available: false, reason: 'DATES_UNAVAILABLE' };
  }

  await expirePendingBookings(listing._id);
  const overlaps = await findOverlaps(listing._id, startDate, endDate);
  if (!overlaps.length) return { available: true };

  const viewer = viewerId ? String(viewerId) : '';
  const onlyOwnPending = viewer && overlaps.every((booking) => (
    booking.status === 'PENDING_OWNER_APPROVAL' && String(booking.renter) === viewer
  ));
  return {
    available: false,
    reason: onlyOwnPending ? 'OWN_PENDING_REQUEST' : 'DATES_UNAVAILABLE',
  };
}

async function withListingLock(listingId, work) {
  const token = new mongoose.Types.ObjectId();
  const started = Date.now();

  while (Date.now() - started < LOCK_WAIT_MS) {
    const staleBefore = new Date(Date.now() - LOCK_STALE_MS);
    await BookingLock.deleteOne({ listing: listingId, lockedAt: { $lt: staleBefore } });
    try {
      await BookingLock.create({ listing: listingId, lockedAt: new Date(), token });
      try {
        return await work();
      } finally {
        await BookingLock.deleteOne({ listing: listingId, token });
      }
    } catch (error) {
      if (error.code !== 11000) throw error;
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  }

  throw new AppError('Please try again.', HTTP_STATUS.CONFLICT, 'DATES_UNAVAILABLE');
}

let expiryTimerStarted = false;

function ensureExpiryTimer() {
  if (expiryTimerStarted) return;
  expiryTimerStarted = true;
  const timer = setInterval(() => {
    expirePendingBookings().catch(() => logger.error('booking_expired_failed'));
  }, 60 * 1000);
  if (typeof timer.unref === 'function') timer.unref();
}

ensureExpiryTimer();

module.exports = {
  expirePendingBookings,
  rangeHitsBlockedDate,
  findOverlaps,
  getCalendar,
  describeAvailability,
  withListingLock,
};
