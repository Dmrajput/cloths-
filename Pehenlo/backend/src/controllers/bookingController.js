const { successResponse } = require('../utils/response');
const { MESSAGES } = require('../utils/constants');

const getBookings = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const createBooking = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const getBookingById = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const cancelBooking = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);

module.exports = { getBookings, createBooking, getBookingById, cancelBooking };
