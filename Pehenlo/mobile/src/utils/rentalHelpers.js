import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from '../constants/bookingConstants';
import { PAYMENT_LABELS } from '../constants/rentalConstants';
import { formatDisplayDate, rupees } from './bookingHelpers';
import { isPaymentExpired } from './paymentHelpers';

export function getBookingStatusLabel(status) {
  return BOOKING_STATUS_LABELS[status] || 'Booking';
}

export function getPaymentStatusLabel(status) {
  return PAYMENT_LABELS[status] || 'Payment';
}

export function formatLongDate(key) {
  if (!key) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${key}T00:00:00Z`));
}

export function formatEventTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}

export function canPayBooking(booking, now = Date.now()) {
  if (!booking || booking.role !== 'renter') return false;
  if (booking.paymentStatus === 'PAID') return false;
  return booking.status === BOOKING_STATUS.PAYMENT_REQUIRED && !isPaymentExpired(booking, now);
}

export function canCancelBooking(booking, now = Date.now()) {
  if (!booking || booking.role !== 'renter') return false;
  if (booking.status === BOOKING_STATUS.PENDING_OWNER_APPROVAL) {
    return !booking.bookingExpiresAt || new Date(booking.bookingExpiresAt).getTime() > now;
  }
  if (booking.status === BOOKING_STATUS.PAYMENT_REQUIRED) return !isPaymentExpired(booking, now);
  return false;
}

export function canOwnerAccept(booking, now = Date.now()) {
  if (!booking || booking.role !== 'owner') return false;
  if (booking.status !== BOOKING_STATUS.PENDING_OWNER_APPROVAL) return false;
  return !booking.bookingExpiresAt || new Date(booking.bookingExpiresAt).getTime() > now;
}

export function canOwnerReject(booking, now = Date.now()) {
  return canOwnerAccept(booking, now);
}

export function securityDepositNote(booking) {
  if (!booking) return '';
  if (booking.paymentStatus === 'REFUNDED') return 'Security deposit refunded';
  if (booking.paymentStatus === 'PARTIALLY_REFUNDED') return 'Security deposit partially refunded';
  if (booking.paymentStatus === 'REFUND_PENDING') return 'Security deposit refund pending';
  if (booking.paymentStatus === 'PAID') return 'Security deposit paid';
  return 'Security deposit payable with booking';
}

export function rentalAttention(booking, now = Date.now()) {
  if (!booking) return '';
  if (booking.role === 'owner' && booking.status === BOOKING_STATUS.PAYMENT_REQUIRED) return 'Waiting for renter payment';
  if (booking.role === 'renter' && booking.status === BOOKING_STATUS.PENDING_OWNER_APPROVAL) return 'Waiting for owner approval';
  if (booking.status === BOOKING_STATUS.PAYMENT_REQUIRED && isPaymentExpired(booking, now)) return 'The booking/payment window has expired.';
  if (booking.role === 'renter' && booking.status === BOOKING_STATUS.PAYMENT_REQUIRED) return 'Payment required';
  if (booking.status === BOOKING_STATUS.CONFIRMED) return 'Booking confirmed';
  if (booking.status === BOOKING_STATUS.ACTIVE) return booking.role === 'renter' ? 'Your rental is active' : 'Rental is active';
  if (booking.status === BOOKING_STATUS.RETURN_PENDING) return 'Return pending';
  if (booking.status === BOOKING_STATUS.EXPIRED) return 'The booking/payment window has expired.';
  return '';
}

export function getPrimaryBookingCTA(booking, now = Date.now()) {
  if (canPayBooking(booking, now)) return 'Pay Now';
  if (canCancelBooking(booking, now) && booking.status === BOOKING_STATUS.PENDING_OWNER_APPROVAL) return 'Cancel Request';
  if (canOwnerAccept(booking, now)) return 'Accept';
  return '';
}

export function fulfillmentLabel(method) {
  if (method === 'DELIVERY') return 'Delivery';
  if (method === 'PICKUP') return 'Pickup';
  return 'Fulfillment';
}

export function rentalDateLabel(booking) {
  if (!booking?.startDate || !booking?.endDate) return '';
  return `${formatDisplayDate(booking.startDate)} – ${formatDisplayDate(booking.endDate)}`;
}

export function rentalAmountLabel(booking) {
  return `${rupees(booking?.totalBeforeDeposit)} rental`;
}
