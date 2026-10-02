const crypto = require('crypto');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { BOOKING, HTTP_STATUS } = require('../utils/constants');
const { normalizePhone } = require('../utils/phone');
const { dateKeyToUtc, isDateKey, utcToDateKey, validateRentalDateRange } = require('../utils/dateUtils');
const { calculateBookingPrice } = require('./bookingPricingService');
const {
  describeAvailability,
  expirePendingBookings,
  findOverlaps,
  withListingLock,
} = require('./availabilityService');
const { toBooking } = require('../utils/bookingPresenter');
const { listBookingEvents, recordBookingEvent } = require('./bookingEventService');

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;
const LIST_POPULATE = [
  { path: 'listing', select: 'title coverImage city status isActive' },
  { path: 'renter', select: 'name profileImage' },
  { path: 'owner', select: 'name profileImage' },
];
const DETAIL_POPULATE = [
  {
    path: 'listing',
    select: 'title coverImage city status isActive size color category',
    populate: { path: 'category', select: 'name' },
  },
  { path: 'renter', select: 'name profileImage' },
  { path: 'owner', select: 'name profileImage' },
];
const GROUPS = {
  upcoming: ['PENDING_OWNER_APPROVAL', 'PAYMENT_REQUIRED', 'CONFIRMED'],
  active: ['ACTIVE', 'RETURN_PENDING'],
  past: ['COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED', 'DISPUTED'],
  requests: ['PENDING_OWNER_APPROVAL'],
};
const STATUSES = [
  'PENDING_OWNER_APPROVAL', 'PAYMENT_REQUIRED', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'ACTIVE',
  'RETURN_PENDING', 'COMPLETED', 'DISPUTED', 'EXPIRED',
];

const createAttempts = new Map();

function assertId(value, label) {
  if (typeof value !== 'string' || !OBJECT_ID.test(value)) {
    throw new AppError(`${label} is invalid`, HTTP_STATUS.BAD_REQUEST, label === 'Listing' ? 'INVALID_LISTING_ID' : 'INVALID_BOOKING_ID');
  }
}

function cleanText(value, max, label) {
  if (value == null || value === '') return '';
  if (typeof value !== 'string') {
    throw new AppError(`${label} is invalid`, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  const cleaned = value.replace(/<[^>]*>/g, '').replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (cleaned.length > max) {
    throw new AppError(`${label} must be ${max} characters or fewer`, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  return cleaned;
}

function assertCreateRate(userId) {
  const now = Date.now();
  const key = String(userId);
  const recent = (createAttempts.get(key) || []).filter((stamp) => now - stamp < BOOKING.CREATE_WINDOW_MS);
  if (recent.length >= BOOKING.CREATE_LIMIT) {
    throw new AppError('Please wait before sending another booking request.', HTTP_STATUS.TOO_MANY_REQUESTS, 'BOOKING_RATE_LIMIT');
  }
  recent.push(now);
  createAttempts.set(key, recent);
}

async function loadActiveListing(listingId) {
  assertId(listingId, 'Listing');
  const listing = await Listing.findById(listingId);
  if (!listing || listing.status !== 'ACTIVE' || !listing.isActive) {
    throw new AppError('This outfit is no longer available', HTTP_STATUS.NOT_FOUND, 'LISTING_NOT_FOUND');
  }
  if (!(Number(listing.price) > 0) || !(Number(listing.rentalDuration) >= 1)) {
    throw new AppError('This outfit is no longer available', HTTP_STATUS.CONFLICT, 'LISTING_UNAVAILABLE');
  }
  return listing;
}

function readDates(body, listing) {
  const startDate = body?.startDate;
  const endDate = body?.endDate;
  const check = validateRentalDateRange(startDate, endDate, { minimumDays: listing.rentalDuration });
  if (!check.ok) {
    throw new AppError(check.message, HTTP_STATUS.BAD_REQUEST, check.code);
  }
  return { startDate, endDate, rentalDays: check.rentalDays };
}

function readFulfillment(listing, method) {
  if (method !== 'PICKUP' && method !== 'DELIVERY') {
    throw new AppError('Choose pickup or delivery.', HTTP_STATUS.BAD_REQUEST, 'INVALID_FULFILLMENT_METHOD');
  }
  if (method === 'PICKUP' && !listing.pickupAvailable) {
    throw new AppError('Pickup is not available for this outfit.', HTTP_STATUS.BAD_REQUEST, 'INVALID_FULFILLMENT_METHOD');
  }
  if (method === 'DELIVERY' && !listing.deliveryAvailable) {
    throw new AppError('Delivery is not available for this outfit.', HTTP_STATUS.BAD_REQUEST, 'INVALID_FULFILLMENT_METHOD');
  }
  return method;
}

function readAddress(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError('A delivery address is required', HTTP_STATUS.BAD_REQUEST, 'DELIVERY_ADDRESS_REQUIRED');
  }
  const name = cleanText(input.name, 60, 'Name');
  const phone = normalizePhone(input.phone);
  const addressLine1 = cleanText(input.addressLine1, 120, 'Address');
  const addressLine2 = cleanText(input.addressLine2, 120, 'Address');
  const area = cleanText(input.area, 80, 'Area');
  const city = cleanText(input.city, 80, 'City');
  const state = cleanText(input.state, 80, 'State');
  const pincode = typeof input.pincode === 'string' || typeof input.pincode === 'number'
    ? String(input.pincode).replace(/\D/g, '')
    : '';
  if (!name || !phone || !addressLine1 || !area || !city || !state || !/^\d{6}$/.test(pincode)) {
    throw new AppError('A complete delivery address is required', HTTP_STATUS.BAD_REQUEST, 'DELIVERY_ADDRESS_REQUIRED');
  }
  return { name, phone, addressLine1, addressLine2, area, city, state, pincode };
}

function makeBookingReference() {
  const year = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(new Date());
  return `PHN-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function snapshotListing(listing) {
  let category = '';
  if (listing.category) {
    const Category = require('../models/Category');
    const doc = await Category.findById(listing.category).select('name');
    category = doc?.name || '';
  }
  const coverImage = listing.coverImage || listing.images?.[0]?.url || '';
  return {
    title: listing.title || '',
    coverImage,
    category,
    size: listing.size || '',
    color: listing.color || '',
    city: listing.city || '',
  };
}

async function ensureReference(booking) {
  if (booking.bookingReference) return booking.bookingReference;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const bookingReference = makeBookingReference();
    try {
      const updated = await Booking.findOneAndUpdate(
        { _id: booking._id, bookingReference: { $in: [null, ''] } },
        { $set: { bookingReference } },
        { new: true }
      );
      if (updated?.bookingReference) {
        booking.bookingReference = updated.bookingReference;
        return updated.bookingReference;
      }
      const current = await Booking.findById(booking._id).select('bookingReference');
      if (current?.bookingReference) {
        booking.bookingReference = current.bookingReference;
        return current.bookingReference;
      }
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }
  return '';
}

async function present(booking, viewerId, { detailed = false } = {}) {
  await ensureReference(booking);
  const populated = await Booking.findById(booking._id).populate(detailed ? DETAIL_POPULATE : LIST_POPULATE);
  const events = detailed ? await listBookingEvents(booking._id) : [];
  return toBooking(populated, viewerId, { detailed, events });
}

async function previewBookingPrice(listingId, body) {
  const listing = await loadActiveListing(listingId);
  const { startDate, endDate } = readDates(body, listing);
  if (!listing.pickupAvailable && !listing.deliveryAvailable) {
    throw new AppError('This outfit is no longer available', HTTP_STATUS.CONFLICT, 'LISTING_UNAVAILABLE');
  }
  const fulfillmentMethod = body?.fulfillmentMethod
    ? readFulfillment(listing, body.fulfillmentMethod)
    : (listing.pickupAvailable ? 'PICKUP' : 'DELIVERY');
  return calculateBookingPrice({ listing, startDate, endDate, fulfillmentMethod });
}

async function createBooking(user, body) {
  const listing = await loadActiveListing(body?.listingId);
  if (String(listing.owner) === String(user._id)) {
    throw new AppError('You cannot book your own outfit.', HTTP_STATUS.FORBIDDEN, 'SELF_BOOKING_NOT_ALLOWED');
  }

  const { startDate, endDate } = readDates(body, listing);
  const fulfillmentMethod = readFulfillment(listing, body?.fulfillmentMethod);
  const deliveryAddress = fulfillmentMethod === 'DELIVERY' ? readAddress(body?.deliveryAddress) : null;
  const renterNote = cleanText(body?.renterNote, BOOKING.MAX_NOTE, 'Message');
  const pricing = calculateBookingPrice({ listing, startDate, endDate, fulfillmentMethod });

  if (body?.expectedTotalBeforeDeposit != null) {
    const expected = Number(body.expectedTotalBeforeDeposit);
    if (!Number.isInteger(expected) || expected !== pricing.totalBeforeDeposit) {
      throw new AppError(
        'The rental price has changed',
        HTTP_STATUS.CONFLICT,
        'PRICE_CHANGED',
        null,
        { pricing }
      );
    }
  }

  assertCreateRate(user._id);
  const booking = await withListingLock(listing._id, async () => {
    await expirePendingBookings(listing._id);
    const sameRequest = await Booking.findOne({
      listing: listing._id,
      renter: user._id,
      status: 'PENDING_OWNER_APPROVAL',
      startDate: dateKeyToUtc(startDate),
      endDate: dateKeyToUtc(endDate),
    }).select('_id');
    if (sameRequest) {
      throw new AppError(
        'You already have a booking request for these dates.',
        HTTP_STATUS.CONFLICT,
        'DUPLICATE_BOOKING_REQUEST'
      );
    }

    const availability = await describeAvailability(listing, startDate, endDate, user._id);
    if (!availability.available) {
      throw new AppError('These dates are no longer available', HTTP_STATUS.CONFLICT, 'DATES_UNAVAILABLE');
    }

    const listingSnapshot = await snapshotListing(listing);
    let created;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        created = await Booking.create({
      renter: user._id,
      owner: listing.owner,
      listing: listing._id,
      listingTitle: listingSnapshot.title,
      listingCoverImage: listingSnapshot.coverImage,
      listingSnapshot,
      bookingReference: makeBookingReference(),
      requestedAt: new Date(),
      startDate: dateKeyToUtc(startDate),
      endDate: dateKeyToUtc(endDate),
      rentalDays: pricing.rentalDays,
      rentalPeriods: pricing.rentalPeriods,
      rentalPricePerPeriod: pricing.rentalPricePerPeriod,
      rentalSubtotal: pricing.rentalSubtotal,
      cleaningFee: pricing.cleaningFee,
      deliveryFee: pricing.deliveryFee,
      securityDeposit: pricing.securityDeposit,
      platformFee: pricing.platformFee,
      totalBeforeDeposit: pricing.totalBeforeDeposit,
      totalIncludingDeposit: pricing.totalIncludingDeposit,
      currency: BOOKING.CURRENCY,
      fulfillmentMethod,
      pickupArea: fulfillmentMethod === 'PICKUP'
        ? [listing.pickupArea, listing.city].filter(Boolean).join(', ')
        : '',
      deliveryAddress,
      status: 'PENDING_OWNER_APPROVAL',
      paymentStatus: 'NOT_STARTED',
      renterNote,
      bookingExpiresAt: new Date(Date.now() + BOOKING.REQUEST_EXPIRY_MINUTES * 60 * 1000),
    });
        break;
      } catch (error) {
        if (error.code !== 11000 || attempt === 2) throw error;
      }
    }

    const overlaps = await findOverlaps(listing._id, startDate, endDate, created._id);
    const lost = overlaps.some((other) => (
      other.status !== 'PENDING_OWNER_APPROVAL' || String(other._id) < String(created._id)
    ));
    if (lost) {
      await Booking.deleteOne({ _id: created._id, status: 'PENDING_OWNER_APPROVAL' });
      throw new AppError('These dates are no longer available', HTTP_STATUS.CONFLICT, 'DATES_UNAVAILABLE');
    }
    return created;
  });

  logger.info('booking_created', { bookingId: String(booking._id) });
  await recordBookingEvent(booking._id, 'BOOKING_CREATED', user._id);
  const { notifyBookingRequested } = require('./notificationService');
  await notifyBookingRequested(booking);
  return present(booking, user._id, { detailed: true });
}

async function loadOwned(user, bookingId, role) {
  assertId(bookingId, 'Booking');
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND');
  }
  const isRenter = String(booking.renter) === String(user._id);
  const isOwner = String(booking.owner) === String(user._id);
  if (role === 'renter' && !isRenter) {
    throw new AppError('You cannot update this booking.', HTTP_STATUS.FORBIDDEN, 'NOT_AUTHORIZED');
  }
  if (role === 'owner' && !isOwner) {
    throw new AppError('You cannot update this booking.', HTTP_STATUS.FORBIDDEN, 'NOT_AUTHORIZED');
  }
  if (!isRenter && !isOwner) {
    throw new AppError('You cannot view this booking.', HTTP_STATUS.FORBIDDEN, 'NOT_AUTHORIZED');
  }
  return booking;
}

async function expireIfNeeded(booking) {
  if (booking.status === 'PENDING_OWNER_APPROVAL' && booking.bookingExpiresAt && booking.bookingExpiresAt < new Date()) {
    booking.status = 'EXPIRED';
    booking.expiredAt = new Date();
    await booking.save();
    await recordBookingEvent(booking._id, 'BOOKING_EXPIRED', null);
    logger.info('booking_expired', { bookingId: String(booking._id) });
    const { notifyBookingExpired } = require('./notificationService');
    await notifyBookingExpired(booking);
    return true;
  }
  if (booking.status === 'PAYMENT_REQUIRED' && booking.paymentDueAt && booking.paymentDueAt < new Date()) {
    booking.status = 'EXPIRED';
    booking.paymentStatus = 'EXPIRED';
    booking.paymentFailureReason = 'Payment window expired';
    booking.expiredAt = new Date();
    await booking.save();
    const Payment = require('../models/Payment');
    await Payment.updateMany(
      { booking: booking._id, status: { $in: ['INITIATED', 'ORDER_CREATED', 'PAYMENT_PROCESSING'] } },
      { $set: { status: 'EXPIRED', failureReason: 'Payment window expired' } }
    );
    await recordBookingEvent(booking._id, 'BOOKING_EXPIRED', null);
    logger.info('payment_window_expired', { bookingId: String(booking._id) });
    const { notifyBookingExpired } = require('./notificationService');
    await notifyBookingExpired(booking, { paymentWindow: true });
    return true;
  }
  return false;
}

async function getBooking(user, bookingId) {
  const booking = await loadOwned(user, bookingId);
  await expireIfNeeded(booking);
  const payload = await present(booking, user._id, { detailed: true });
  if (payload.role === 'owner') {
    const { sellerEarningForBooking } = require('./earningService');
    payload.sellerEarning = await sellerEarningForBooking(booking._id, user._id);
  }
  const { stateForBooking } = require('./reviewService');
  payload.reviewState = await stateForBooking(user._id, booking);
  return payload;
}

async function listMine(user, query) {
  const role = query?.role === undefined || query?.role === '' ? 'renter' : query.role;
  if (role !== 'renter' && role !== 'owner') {
    throw new AppError('Role is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  const page = Number(query?.page || 1);
  const limit = Number(query?.limit || 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new AppError('Page or limit is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  const group = query?.group == null || query.group === '' ? '' : query.group;
  if (group && !GROUPS[group]) {
    throw new AppError('Group is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  if (query?.status != null && query.status !== '' && (typeof query.status !== 'string' || !STATUSES.includes(query.status))) {
    throw new AppError('Status is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  if (group && query?.status && !GROUPS[group].includes(query.status)) {
    throw new AppError('Status is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  let fromDate = null;
  let toDate = null;
  if (query?.fromDate) {
    if (!isDateKey(query.fromDate)) throw new AppError('Date is invalid', HTTP_STATUS.BAD_REQUEST, 'DATES_INVALID');
    fromDate = query.fromDate;
  }
  if (query?.toDate) {
    if (!isDateKey(query.toDate)) throw new AppError('Date is invalid', HTTP_STATUS.BAD_REQUEST, 'DATES_INVALID');
    toDate = query.toDate;
  }

  await expirePendingBookings();
  const filter = role === 'owner' ? { owner: user._id } : { renter: user._id };
  if (group) filter.status = query?.status || { $in: GROUPS[group] };
  else if (query?.status) filter.status = query.status;
  if (fromDate || toDate) {
    filter.startDate = {};
    if (fromDate) filter.startDate.$gte = dateKeyToUtc(fromDate);
    if (toDate) filter.startDate.$lte = dateKeyToUtc(toDate);
  }
  const total = await Booking.countDocuments(filter);
  const items = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(LIST_POPULATE);
  await Promise.all(items.map((item) => ensureReference(item)));
  const totalPages = Math.ceil(total / limit) || 0;
  return {
    items: items.map((item) => toBooking(item, user._id)),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
}

async function acceptBooking(user, bookingId, body) {
  const ownerNote = cleanText(body?.ownerNote, BOOKING.MAX_NOTE, 'Note');
  const existing = await loadOwned(user, bookingId, 'owner');
  if (await expireIfNeeded(existing)) {
    throw new AppError('This booking request has expired', HTTP_STATUS.CONFLICT, 'BOOKING_EXPIRED');
  }
  if (existing.status !== 'PENDING_OWNER_APPROVAL') {
    throw new AppError('This request is no longer pending', HTTP_STATUS.CONFLICT, 'INVALID_BOOKING_STATUS');
  }

  const listing = await Listing.findById(existing.listing);
  if (!listing || listing.status !== 'ACTIVE' || !listing.isActive) {
    throw new AppError('This outfit is no longer available', HTTP_STATUS.CONFLICT, 'LISTING_UNAVAILABLE');
  }

  const startDate = utcToDateKey(existing.startDate);
  const endDate = utcToDateKey(existing.endDate);

  const booking = await withListingLock(existing.listing, async () => {
    await expirePendingBookings(existing.listing);
    const overlaps = await findOverlaps(existing.listing, startDate, endDate, existing._id);
    if (overlaps.length) {
      throw new AppError('These dates are no longer available', HTTP_STATUS.CONFLICT, 'DATES_UNAVAILABLE');
    }
    const updated = await Booking.findOneAndUpdate(
      {
        _id: existing._id,
        owner: user._id,
        status: 'PENDING_OWNER_APPROVAL',
        bookingExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          status: 'PAYMENT_REQUIRED',
          paymentStatus: 'PENDING',
          paymentDueAt: new Date(Date.now() + BOOKING.PAYMENT_EXPIRY_MINUTES * 60 * 1000),
          paymentRequiredAt: new Date(),
          acceptedAt: new Date(),
          ownerNote,
          paymentFailureReason: '',
        },
      },
      { new: true }
    );
    if (!updated) {
      throw new AppError('This booking request has expired', HTTP_STATUS.CONFLICT, 'BOOKING_EXPIRED');
    }
    const confirmedClash = await findOverlaps(existing.listing, startDate, endDate, updated._id);
    if (confirmedClash.length) {
      await Booking.updateOne(
        { _id: updated._id, status: 'PAYMENT_REQUIRED' },
        {
          $set: {
            status: 'PENDING_OWNER_APPROVAL',
            acceptedAt: null,
            ownerNote: '',
            paymentStatus: 'NOT_STARTED',
            paymentDueAt: null,
            paymentRequiredAt: null,
          },
        }
      );
      throw new AppError('These dates are no longer available', HTTP_STATUS.CONFLICT, 'DATES_UNAVAILABLE');
    }
    return updated;
  });

  logger.info('booking_accepted', { bookingId: String(booking._id) });
  await recordBookingEvent(booking._id, 'OWNER_ACCEPTED', user._id);
  await recordBookingEvent(booking._id, 'PAYMENT_REQUIRED', user._id);
  const { notifyBookingAccepted } = require('./notificationService');
  await notifyBookingAccepted(booking);
  return present(booking, user._id, { detailed: true });
}

async function rejectBooking(user, bookingId, body) {
  const rejectedReason = cleanText(body?.reason, BOOKING.MAX_NOTE, 'Reason');
  const ownerNote = cleanText(body?.ownerNote, BOOKING.MAX_NOTE, 'Note');
  const existing = await loadOwned(user, bookingId, 'owner');
  if (await expireIfNeeded(existing)) {
    throw new AppError('This booking request has expired', HTTP_STATUS.CONFLICT, 'BOOKING_EXPIRED');
  }
  if (existing.status !== 'PENDING_OWNER_APPROVAL') {
    throw new AppError('This request is no longer pending', HTTP_STATUS.CONFLICT, 'INVALID_BOOKING_STATUS');
  }

  const booking = await withListingLock(existing.listing, async () => {
    const updated = await Booking.findOneAndUpdate(
      {
        _id: existing._id,
        owner: user._id,
        status: 'PENDING_OWNER_APPROVAL',
        bookingExpiresAt: { $gt: new Date() },
      },
      { $set: { status: 'REJECTED', rejectedAt: new Date(), rejectedReason, ownerNote } },
      { new: true }
    );
    if (!updated) {
      throw new AppError('This booking request has expired', HTTP_STATUS.CONFLICT, 'BOOKING_EXPIRED');
    }
    return updated;
  });

  logger.info('booking_rejected', { bookingId: String(booking._id) });
  await recordBookingEvent(booking._id, 'OWNER_REJECTED', user._id);
  const { notifyBookingRejected } = require('./notificationService');
  await notifyBookingRejected(booking);
  return present(booking, user._id, { detailed: true });
}

async function cancelBooking(user, bookingId, body) {
  const cancelledReason = cleanText(body?.reason, BOOKING.MAX_NOTE, 'Reason');
  const existing = await loadOwned(user, bookingId, 'renter');
  if (await expireIfNeeded(existing)) {
    throw new AppError('This booking request has expired', HTTP_STATUS.CONFLICT, 'BOOKING_EXPIRED');
  }
  if (!['PENDING_OWNER_APPROVAL', 'PAYMENT_REQUIRED'].includes(existing.status)) {
    throw new AppError('Only a pending request can be cancelled', HTTP_STATUS.CONFLICT, 'INVALID_BOOKING_STATUS');
  }

  const booking = await withListingLock(existing.listing, async () => {
    const filter = {
      _id: existing._id,
      renter: user._id,
      status: existing.status,
    };
    if (existing.status === 'PENDING_OWNER_APPROVAL') filter.bookingExpiresAt = { $gt: new Date() };
    if (existing.status === 'PAYMENT_REQUIRED') filter.paymentDueAt = { $gt: new Date() };
    const updated = await Booking.findOneAndUpdate(
      filter,
      { $set: { status: 'CANCELLED', cancelledAt: new Date(), cancelledReason } },
      { new: true }
    );
    if (updated) {
      const Payment = require('../models/Payment');
      await Payment.updateMany(
        { booking: updated._id, status: { $in: ['INITIATED', 'ORDER_CREATED', 'PAYMENT_PROCESSING'] } },
        { $set: { status: 'EXPIRED', failureReason: 'Booking cancelled' } }
      );
    }
    if (!updated) {
      const expiredPayment = existing.status === 'PAYMENT_REQUIRED';
      throw new AppError(
        expiredPayment ? 'The payment window has expired.' : 'This booking request has expired',
        HTTP_STATUS.CONFLICT,
        expiredPayment ? 'PAYMENT_EXPIRED' : 'BOOKING_EXPIRED'
      );
    }
    return updated;
  });

  logger.info('booking_cancelled', { bookingId: String(booking._id) });
  await recordBookingEvent(booking._id, 'BOOKING_CANCELLED', user._id);
  const { notifyBookingCancelled } = require('./notificationService');
  await notifyBookingCancelled(booking);
  return present(booking, user._id, { detailed: true });
}

async function rentalCounts(user) {
  await expirePendingBookings();
  const now = new Date();
  const [paymentRequired, pendingRequests] = await Promise.all([
    Booking.countDocuments({ renter: user._id, status: 'PAYMENT_REQUIRED', paymentDueAt: { $gt: now } }),
    Booking.countDocuments({ owner: user._id, status: 'PENDING_OWNER_APPROVAL', bookingExpiresAt: { $gt: now } }),
  ]);
  return {
    renter: { paymentRequired },
    owner: { pendingRequests },
    actionable: paymentRequired + pendingRequests,
  };
}

module.exports = {
  previewBookingPrice,
  createBooking,
  getBooking,
  listMine,
  rentalCounts,
  acceptBooking,
  rejectBooking,
  cancelBooking,
};
