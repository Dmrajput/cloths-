const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');
const AppError = require('../utils/AppError');
const Listing = require('../models/Listing');
const bookingService = require('../services/bookingService');
const { getCalendar, describeAvailability, expirePendingBookings } = require('../services/availabilityService');
const { validateRentalDateRange } = require('../utils/dateUtils');

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

function assertListingId(value) {
  if (typeof value !== 'string' || !OBJECT_ID.test(value)) {
    throw new AppError('Listing id is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_LISTING_ID');
  }
}

async function loadPublicListing(listingId) {
  assertListingId(listingId);
  const listing = await Listing.findOne({ _id: listingId, status: 'ACTIVE', isActive: true });
  if (!listing) {
    throw new AppError('This outfit is no longer available', HTTP_STATUS.NOT_FOUND, 'LISTING_NOT_FOUND');
  }
  return listing;
}

const getAvailability = async (req, res, next) => {
  try {
    const listing = await loadPublicListing(req.params.id);
    const check = validateRentalDateRange(req.query.startDate, req.query.endDate, {
      minimumDays: listing.rentalDuration,
    });
    if (!check.ok) {
      throw new AppError(check.message, HTTP_STATUS.BAD_REQUEST, check.code);
    }
    await expirePendingBookings(listing._id);
    const result = await describeAvailability(listing, req.query.startDate, req.query.endDate, req.user?._id);
    return successResponse(res, {
      ...result,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      rentalDays: check.rentalDays,
    }, 'Availability checked');
  } catch (error) {
    return next(error);
  }
};

const getAvailabilityCalendar = async (req, res, next) => {
  try {
    const listing = await loadPublicListing(req.params.id);
    const calendar = await getCalendar(listing, req.query.month);
    if (!calendar) {
      throw new AppError('Month is invalid', HTTP_STATUS.BAD_REQUEST, 'DATES_INVALID');
    }
    return successResponse(res, calendar, 'Availability calendar');
  } catch (error) {
    return next(error);
  }
};

const previewBookingPrice = async (req, res, next) => {
  try {
    const pricing = await bookingService.previewBookingPrice(req.params.id, req.body);
    return successResponse(res, pricing, 'Booking price');
  } catch (error) {
    return next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user, req.body);
    return successResponse(res, { booking }, 'Booking request sent', HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

const getMyBookingCounts = async (req, res, next) => {
  try {
    const counts = await bookingService.rentalCounts(req.user);
    return successResponse(res, counts, 'Booking counts');
  } catch (error) {
    return next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const result = await bookingService.listMine(req.user, req.query);
    return successResponse(res, result, 'Bookings');
  } catch (error) {
    return next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBooking(req.user, req.params.id);
    return successResponse(res, { booking }, 'Booking');
  } catch (error) {
    return next(error);
  }
};

const acceptBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.acceptBooking(req.user, req.params.id, req.body);
    return successResponse(res, { booking }, 'Booking accepted. Payment is required.');
  } catch (error) {
    return next(error);
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.rejectBooking(req.user, req.params.id, req.body);
    return successResponse(res, { booking }, 'Booking rejected');
  } catch (error) {
    return next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.user, req.params.id, req.body);
    return successResponse(res, { booking }, 'Booking cancelled');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAvailability,
  getAvailabilityCalendar,
  previewBookingPrice,
  createBooking,
  getMyBookingCounts,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
};
