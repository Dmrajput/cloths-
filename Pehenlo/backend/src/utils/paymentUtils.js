const crypto = require('crypto');

function rupeesToPaise(rupees) {
  const amount = Number(rupees);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

function paiseToRupees(paise) {
  return Math.round(Number(paise) || 0) / 100;
}

function expectedChargePaise(booking) {
  return rupeesToPaise(booking.totalIncludingDeposit);
}

function signaturesMatch(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  if (!a.length || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function paymentSignature(orderId, paymentId, secret) {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}

function webhookSignature(rawBody, secret) {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

function safeFailureReason(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, '').replace(/[\u0000-\u001F]/g, '').trim().slice(0, 300);
}

module.exports = {
  rupeesToPaise,
  paiseToRupees,
  expectedChargePaise,
  signaturesMatch,
  paymentSignature,
  webhookSignature,
  safeFailureReason,
};
