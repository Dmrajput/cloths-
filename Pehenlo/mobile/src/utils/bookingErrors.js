const MESSAGES = {
  DATES_UNAVAILABLE: 'These dates are no longer available. Please choose another date range.',
  OWN_PENDING_REQUEST: 'Your booking request is pending owner approval.',
  PRICE_CHANGED: 'The price has changed. Please review the updated booking amount.',
  SELF_BOOKING_NOT_ALLOWED: 'You cannot book your own outfit.',
  DUPLICATE_BOOKING_REQUEST: 'You already have a booking request for these dates.',
  BOOKING_EXPIRED: 'This booking request has expired.',
  LISTING_UNAVAILABLE: 'This outfit is no longer available.',
  LISTING_NOT_FOUND: 'This outfit is no longer available.',
  INVALID_FULFILLMENT_METHOD: 'Choose a pickup or delivery option this outfit supports.',
  DELIVERY_ADDRESS_REQUIRED: 'Add a complete delivery address to continue.',
  NOT_AUTHORIZED: 'You cannot open this booking.',
  BOOKING_RATE_LIMIT: 'Please wait before sending another booking request.',
  INVALID_BOOKING_STATUS: 'This booking was updated. Refresh to see the latest status.',
  NETWORK_ERROR: 'Couldn’t reach Pehenlo. Check your internet connection and try again.',
  PAYMENT_EXPIRED: 'The payment window has expired.',
  PAYMENT_ALREADY_COMPLETED: 'This booking is already paid.',
  PAYMENT_VERIFICATION_FAILED: 'Payment verification is still pending. Check the booking again in a moment.',
  INVALID_PAYMENT_SIGNATURE: 'Payment could not be verified.',
  PAYMENT_AMOUNT_MISMATCH: 'Payment could not be verified.',
  RAZORPAY_NOT_CONFIGURED: 'Payments are not configured yet.',
  RAZORPAY_ORDER_CREATION_FAILED: 'Payment could not be started. Please try again.',
  BOOKING_NOT_PAYABLE: 'This booking is not waiting for payment.',
  LISTING_UNAVAILABLE: 'This outfit is no longer available.',
  UNAUTHORIZED_PAYMENT_ACCESS: 'You cannot pay for this booking.',
};

export function bookingErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.code === 'NETWORK_ERROR') return MESSAGES.NETWORK_ERROR;
  if (error.code === 'DATES_INVALID' && error.message) return error.message;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return fallback;
}
