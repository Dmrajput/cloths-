const env = require('../config/env');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../utils/constants');
const { paymentSignature, signaturesMatch, webhookSignature } = require('../utils/paymentUtils');

function assertConfigured() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError('Payments are not configured yet.', HTTP_STATUS.SERVICE_UNAVAILABLE || 503, 'RAZORPAY_NOT_CONFIGURED');
  }
}

async function razorpayRequest(path, { method = 'GET', body } = {}) {
  assertConfigured();
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
  let response;
  try {
    response = await fetch(`https://api.razorpay.com/v1${path}`, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    logger.error('razorpay_network_failed', { path, method });
    throw new AppError('Payment could not be started. Please try again.', 502, 'RAZORPAY_ORDER_CREATION_FAILED');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    logger.error('razorpay_request_failed', { path, status: response.status, code: payload?.error?.code || 'UNKNOWN' });
    throw new AppError('Payment could not be started. Please try again.', 502, 'RAZORPAY_ORDER_CREATION_FAILED');
  }
  return payload;
}

function createOrder({ amount, currency, receipt, bookingId }) {
  return razorpayRequest('/orders', {
    method: 'POST',
    body: {
      amount,
      currency,
      receipt,
      notes: { bookingId: String(bookingId) },
    },
  });
}

function fetchPayment(paymentId) {
  return razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`);
}

function fetchOrder(orderId) {
  return razorpayRequest(`/orders/${encodeURIComponent(orderId)}`);
}

function verifyPaymentSignature({ orderId, paymentId, signature }) {
  assertConfigured();
  const expected = paymentSignature(orderId, paymentId, env.RAZORPAY_KEY_SECRET);
  return signaturesMatch(expected, signature);
}

function verifyWebhookSignature(rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !rawBody || !signature) return false;
  const expected = webhookSignature(rawBody, env.RAZORPAY_WEBHOOK_SECRET);
  return signaturesMatch(expected, signature);
}

function publicKeyId() {
  assertConfigured();
  return env.RAZORPAY_KEY_ID;
}

module.exports = {
  createOrder,
  fetchPayment,
  fetchOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  publicKeyId,
};
