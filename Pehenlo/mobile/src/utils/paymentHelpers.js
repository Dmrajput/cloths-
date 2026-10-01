import { PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from '../constants/paymentConstants';
import { BOOKING_STATUS } from '../constants/bookingConstants';

export function formatINR(rupees) {
  return `₹${Number(rupees || 0).toLocaleString('en-IN')}`;
}

export function formatPaiseToINR(paise) {
  return formatINR(Math.round(Number(paise) || 0) / 100);
}

export function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS[status] || status || 'Payment';
}

export function getPaymentStatusColor(status, colors) {
  if (status === PAYMENT_STATUS.PAID) return colors.success;
  if (status === PAYMENT_STATUS.FAILED || status === PAYMENT_STATUS.EXPIRED) return colors.error;
  if (status === PAYMENT_STATUS.PROCESSING) return colors.warning;
  return colors.secondary;
}

export function isPaymentExpired(booking, now = Date.now()) {
  if (!booking) return false;
  if (booking.status === BOOKING_STATUS.EXPIRED || booking.paymentStatus === PAYMENT_STATUS.EXPIRED) return true;
  if (booking.status !== BOOKING_STATUS.PAYMENT_REQUIRED || !booking.paymentDueAt) return false;
  return new Date(booking.paymentDueAt).getTime() <= now;
}

export function canRetryPayment(booking, now = Date.now()) {
  if (!booking || booking.role !== 'renter') return false;
  if (booking.paymentStatus === PAYMENT_STATUS.PAID) return false;
  return booking.status === BOOKING_STATUS.PAYMENT_REQUIRED && !isPaymentExpired(booking, now);
}

export function getPaymentCTA(booking, now = Date.now()) {
  if (!booking) return '';
  if (booking.status === BOOKING_STATUS.PENDING_OWNER_APPROVAL) return 'Waiting for Owner Approval';
  if (booking.status === BOOKING_STATUS.CONFIRMED || booking.paymentStatus === PAYMENT_STATUS.PAID) return 'Booking Confirmed';
  if (booking.status === BOOKING_STATUS.PAYMENT_REQUIRED && isPaymentExpired(booking, now)) return 'Payment Expired';
  if (canRetryPayment(booking, now)) return `Pay ${formatINR(booking.totalIncludingDeposit)}`;
  return '';
}

export function paymentResultState(booking) {
  if (!booking) return 'PENDING';
  if (booking.paymentStatus === PAYMENT_STATUS.PAID && booking.status === BOOKING_STATUS.CONFIRMED) return 'SUCCESS';
  if (isPaymentExpired(booking) || booking.status === BOOKING_STATUS.EXPIRED) return 'EXPIRED';
  if (booking.paymentStatus === PAYMENT_STATUS.FAILED) return 'FAILED';
  if (booking.paymentStatus === PAYMENT_STATUS.PROCESSING) return 'PENDING';
  return 'PENDING';
}
