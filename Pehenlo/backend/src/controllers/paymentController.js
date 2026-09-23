const { successResponse } = require('../utils/response');
const { MESSAGES } = require('../utils/constants');

const createPayment = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const verifyPayment = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const getPaymentHistory = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);

module.exports = { createPayment, verifyPayment, getPaymentHistory };
