const { successResponse, errorResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');
const paymentService = require('../services/paymentService');
const paymentWebhookService = require('../services/paymentWebhookService');

const createOrder = async (req, res, next) => {
  try {
    const payment = await paymentService.createOrder(req.user, req.body?.bookingId);
    return successResponse(res, { payment }, 'Payment order created');
  } catch (error) {
    return next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const result = await paymentService.verifyPayment(req.user, req.body);
    return successResponse(res, result, result.alreadyPaid ? 'Payment already completed' : 'Payment verified');
  } catch (error) {
    return next(error);
  }
};

const getBookingPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.getBookingPayment(req.user, req.params.bookingId);
    return successResponse(res, { payment }, 'Payment status');
  } catch (error) {
    return next(error);
  }
};

const webhook = async (req, res) => {
  try {
    const result = await paymentWebhookService.processWebhook(
      req.rawBody,
      req.get('x-razorpay-signature'),
      req.get('x-razorpay-event-id')
    );
    if (!result.ok) {
      return errorResponse(res, 'Invalid webhook signature', result.status || HTTP_STATUS.BAD_REQUEST, result.code);
    }
    return successResponse(res, null, 'Webhook received');
  } catch (_error) {
    return errorResponse(res, 'Webhook could not be processed', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'WEBHOOK_FAILED');
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getBookingPayment,
  webhook,
};
