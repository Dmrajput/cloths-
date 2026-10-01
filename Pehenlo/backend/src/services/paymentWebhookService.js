const PaymentEvent = require('../models/PaymentEvent');
const logger = require('../utils/logger');
const razorpayService = require('./razorpayService');
const paymentService = require('./paymentService');

async function processWebhook(rawBody, signature, eventId) {
  if (!razorpayService.verifyWebhookSignature(rawBody, signature)) {
    return { ok: false, status: 400, code: 'INVALID_WEBHOOK_SIGNATURE' };
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (_error) {
    return { ok: false, status: 400, code: 'INVALID_WEBHOOK_SIGNATURE' };
  }

  if (eventId) {
    try {
      await PaymentEvent.create({
        eventId,
        eventType: event.event || '',
        razorpayOrderId: event?.payload?.payment?.entity?.order_id || event?.payload?.order?.entity?.id || '',
      });
    } catch (error) {
      if (error.code === 11000) {
        logger.info('payment_webhook_duplicate', { eventType: event.event || '' });
        return { ok: true, duplicate: true };
      }
      throw error;
    }
  }

  const type = event.event;
  if (type === 'payment.captured' || type === 'order.paid') {
    const entity = event?.payload?.payment?.entity || event?.payload?.order?.entity || {};
    const orderId = entity.order_id || entity.id;
    const paymentId = type === 'order.paid' ? '' : entity.id;
    if (!orderId) return { ok: true, ignored: true };
    const Payment = require('../models/Payment');
    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (!payment) {
      logger.warn('payment_webhook_unknown_order', { orderId, eventType: type });
      return { ok: true, ignored: true };
    }
    if (payment.status === 'PAID') {
      const incomingId = type === 'payment.captured' ? entity.id : '';
      if (incomingId && String(payment.razorpayPaymentId || '').startsWith('order:')) {
        payment.razorpayPaymentId = incomingId;
        if (entity.method) payment.method = entity.method;
        await payment.save();
      }
      return { ok: true, duplicate: true };
    }
    if (Number(entity.amount) && Number(entity.amount) !== payment.amount) {
      logger.warn('payment_amount_mismatch', { orderId, eventType: type });
      return { ok: true, ignored: true };
    }
    if (type === 'order.paid' && !paymentId) {
      await paymentService.markPaid(payment, { paymentId: payment.razorpayPaymentId || `order:${orderId}`, signature: '', method: 'webhook' });
      return { ok: true };
    }
    await paymentService.markPaid(payment, { paymentId: paymentId || entity.id, signature: '', method: entity.method || 'webhook' });
    return { ok: true };
  }

  if (type === 'payment.failed') {
    const entity = event?.payload?.payment?.entity || {};
    if (entity.order_id) {
      await paymentService.markFailed(entity.order_id, entity.error_description || 'Payment failed');
    }
    return { ok: true };
  }

  logger.info('payment_webhook_ignored', { eventType: type || 'unknown' });
  return { ok: true, ignored: true };
}

module.exports = { processWebhook };
