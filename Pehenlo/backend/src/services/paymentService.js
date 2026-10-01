const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Listing = require('../models/Listing');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const env = require('../config/env');
const { HTTP_STATUS, BOOKING } = require('../utils/constants');
const { expectedChargePaise, rupeesToPaise, safeFailureReason } = require('../utils/paymentUtils');
const razorpayService = require('./razorpayService');
const { toBooking } = require('../utils/bookingPresenter');

const OPEN_STATUSES = Payment.OPEN_PAYMENT_STATUSES;
const OBJECT_ID = /^[a-fA-F0-9]{24}$/;
const orderAttempts = new Map();

function assertBookingId(value) {
  if (typeof value !== 'string' || !OBJECT_ID.test(value)) {
    throw new AppError('Booking id is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_BOOKING_ID');
  }
}

function assertOrderRate(userId) {
  const now = Date.now();
  const key = String(userId);
  const recent = (orderAttempts.get(key) || []).filter((stamp) => now - stamp < BOOKING.CREATE_WINDOW_MS);
  if (recent.length >= BOOKING.CREATE_LIMIT) {
    throw new AppError('Please wait before trying payment again.', HTTP_STATUS.TOO_MANY_REQUESTS, 'PAYMENT_RATE_LIMIT');
  }
  recent.push(now);
  orderAttempts.set(key, recent);
}

async function expirePayableBookings(listingId) {
  const filter = {
    status: 'PAYMENT_REQUIRED',
    paymentDueAt: { $lt: new Date() },
  };
  if (listingId) filter.listing = listingId;
  const expired = await Booking.find(filter).select('_id');
  if (!expired.length) return 0;
  const ids = expired.map((booking) => booking._id);
  await Booking.updateMany(
    { _id: { $in: ids }, status: 'PAYMENT_REQUIRED' },
    { $set: { status: 'EXPIRED', paymentStatus: 'EXPIRED', paymentFailureReason: 'Payment window expired', expiredAt: new Date() } }
  );
  await Payment.updateMany(
    { booking: { $in: ids }, status: { $in: OPEN_STATUSES } },
    { $set: { status: 'EXPIRED', failureReason: 'Payment window expired' } }
  );
  const { recordBookingEvents } = require('./bookingEventService');
  await recordBookingEvents(ids.map((id) => ({
    booking: id,
    type: 'BOOKING_EXPIRED',
    actor: null,
    timestamp: new Date(),
  })));
  logger.info('payment_window_expired', { count: ids.length });
  return ids.length;
}

async function loadPayableBooking(user, bookingId) {
  assertBookingId(bookingId);
  await expirePayableBookings();
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND');
  if (String(booking.renter) !== String(user._id)) {
    throw new AppError('You cannot pay for this booking.', HTTP_STATUS.FORBIDDEN, 'UNAUTHORIZED_PAYMENT_ACCESS');
  }
  return booking;
}

function assertPayable(booking) {
  if (booking.status === 'EXPIRED' || (booking.paymentDueAt && booking.paymentDueAt <= new Date())) {
    throw new AppError('The payment window has expired.', HTTP_STATUS.CONFLICT, 'PAYMENT_EXPIRED');
  }
  if (booking.status !== 'PAYMENT_REQUIRED') {
    throw new AppError('This booking is not waiting for payment.', HTTP_STATUS.CONFLICT, 'BOOKING_NOT_PAYABLE');
  }
  if (!['PENDING', 'FAILED', 'PROCESSING'].includes(booking.paymentStatus)) {
    if (booking.paymentStatus === 'PAID') {
      throw new AppError('This booking is already paid.', HTTP_STATUS.CONFLICT, 'PAYMENT_ALREADY_COMPLETED');
    }
    throw new AppError('This booking is not waiting for payment.', HTTP_STATUS.CONFLICT, 'BOOKING_NOT_PAYABLE');
  }
}

async function checkoutPayload(payment, booking, user) {
  return {
    paymentId: String(payment._id),
    razorpayOrderId: payment.razorpayOrderId,
    amount: payment.amount,
    currency: payment.currency || 'INR',
    razorpayKeyId: razorpayService.publicKeyId(),
    bookingId: String(booking._id),
    name: user?.name || '',
    contact: user?.phone || '',
    description: booking.listingTitle || 'Pehenlo rental',
  };
}

async function createOrder(user, bookingId) {
  assertOrderRate(user._id);
  const booking = await loadPayableBooking(user, bookingId);
  assertPayable(booking);

  const listing = await Listing.findById(booking.listing).select('status isActive');
  if (!listing || listing.status !== 'ACTIVE' || !listing.isActive) {
    throw new AppError('This outfit is no longer available', HTTP_STATUS.CONFLICT, 'LISTING_UNAVAILABLE');
  }

  const amount = expectedChargePaise(booking);
  if (amount < 100) {
    throw new AppError('This booking cannot be paid.', HTTP_STATUS.CONFLICT, 'BOOKING_NOT_PAYABLE');
  }

  const existing = await Payment.findOne({
    booking: booking._id,
    status: { $in: OPEN_STATUSES },
  });
  if (existing?.razorpayOrderId && (!existing.expiresAt || existing.expiresAt > new Date())) {
    return checkoutPayload(existing, booking, user);
  }
  if (existing) {
    existing.status = 'FAILED';
    existing.failureReason = 'Order was not created';
    await existing.save();
  }

  let payment;
  try {
    payment = await Payment.create({
      booking: booking._id,
      renter: booking.renter,
      owner: booking.owner,
      listing: booking.listing,
      amount,
      currency: env.PAYMENT_CURRENCY || 'INR',
      status: 'INITIATED',
      expiresAt: booking.paymentDueAt,
    });
  } catch (error) {
    if (error.code === 11000) {
      const current = await Payment.findOne({ booking: booking._id, status: { $in: OPEN_STATUSES } });
      if (current?.razorpayOrderId) return checkoutPayload(current, booking, user);
    }
    throw error;
  }

  try {
    const order = await razorpayService.createOrder({
      amount,
      currency: 'INR',
      receipt: String(booking._id).slice(-12),
      bookingId: booking._id,
    });
    if (Number(order.amount) !== amount || order.currency !== 'INR') {
      throw new AppError('Payment amount could not be verified.', HTTP_STATUS.CONFLICT, 'PAYMENT_AMOUNT_MISMATCH');
    }
    payment.razorpayOrderId = order.id;
    payment.status = 'ORDER_CREATED';
    await payment.save();
    booking.razorpayOrderId = order.id;
    booking.paymentId = payment._id;
    booking.paymentStatus = 'PENDING';
    await booking.save();
    logger.info('payment_order_created', { bookingId: String(booking._id), orderId: order.id });
    return checkoutPayload(payment, booking, user);
  } catch (error) {
    payment.status = 'FAILED';
    payment.failureReason = 'Order creation failed';
    await payment.save();
    if (booking.paymentStatus !== 'PAID') {
      booking.paymentStatus = 'FAILED';
      booking.paymentFailureReason = 'Payment could not be started';
      await booking.save();
    }
    if (error instanceof AppError) throw error;
    throw new AppError('Payment could not be started. Please try again.', 502, 'RAZORPAY_ORDER_CREATION_FAILED');
  }
}

async function ensureBookingConfirmed(payment) {
  const booking = await Booking.findById(payment.booking);
  if (!booking) return null;
  if (booking.status === 'CONFIRMED' && booking.paymentStatus === 'PAID') return booking;
  if (booking.status !== 'PAYMENT_REQUIRED') {
    logger.warn('payment_booking_inconsistent', {
      bookingId: String(booking._id),
      paymentId: String(payment._id),
      bookingStatus: booking.status,
    });
    return booking;
  }
  const listing = await Listing.findById(booking.listing).select('status isActive');
  if (!listing || listing.status !== 'ACTIVE' || !listing.isActive) {
    logger.warn('payment_listing_inactive', { bookingId: String(booking._id), paymentId: String(payment._id) });
  }
  booking.status = 'CONFIRMED';
  booking.paymentStatus = 'PAID';
  booking.paymentCompletedAt = booking.paymentCompletedAt || new Date();
  booking.confirmedAt = booking.confirmedAt || new Date();
  booking.paymentId = payment._id;
  booking.razorpayOrderId = payment.razorpayOrderId;
  booking.paymentFailureReason = '';
  await booking.save();
  const { recordBookingEvent } = require('./bookingEventService');
  await recordBookingEvent(booking._id, 'PAYMENT_COMPLETED', booking.renter);
  await recordBookingEvent(booking._id, 'BOOKING_CONFIRMED', booking.renter);
  logger.info('payment_captured', { bookingId: String(booking._id), orderId: payment.razorpayOrderId });
  return booking;
}

async function markPaid(payment, { paymentId, signature, method }) {
  const updated = await Payment.findOneAndUpdate(
    { _id: payment._id, status: { $ne: 'PAID' } },
    {
      $set: {
        status: 'PAID',
        razorpayPaymentId: paymentId,
        razorpaySignature: signature || payment.razorpaySignature || '',
        method: method || payment.method || '',
        paidAt: new Date(),
        verifiedAt: new Date(),
        failureReason: '',
      },
    },
    { new: true }
  );
  const current = updated || await Payment.findById(payment._id);
  const booking = await ensureBookingConfirmed(current);
  return { payment: current, booking, alreadyPaid: !updated };
}

async function verifyPayment(user, body) {
  const bookingId = body?.bookingId;
  const orderId = body?.razorpayOrderId;
  const paymentId = body?.razorpayPaymentId;
  const signature = body?.razorpaySignature;
  if (typeof orderId !== 'string' || typeof paymentId !== 'string' || typeof signature !== 'string') {
    throw new AppError('Payment verification failed.', HTTP_STATUS.BAD_REQUEST, 'PAYMENT_VERIFICATION_FAILED');
  }

  const booking = await loadPayableBooking(user, bookingId);
  if (booking.paymentStatus === 'PAID' && booking.status === 'CONFIRMED') {
    return { booking: await presentBooking(booking, user._id), alreadyPaid: true };
  }
  if (booking.status === 'EXPIRED' || (booking.paymentDueAt && booking.paymentDueAt <= new Date() && booking.status !== 'CONFIRMED')) {
    throw new AppError('The payment window has expired.', HTTP_STATUS.CONFLICT, 'PAYMENT_EXPIRED');
  }

  const payment = await Payment.findOne({ booking: booking._id, razorpayOrderId: orderId });
  if (!payment) throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND, 'PAYMENT_NOT_FOUND');
  if (payment.status === 'PAID') {
    await ensureBookingConfirmed(payment);
    const fresh = await Booking.findById(booking._id);
    return { booking: await presentBooking(fresh, user._id), alreadyPaid: true };
  }
  if (payment.expiresAt && payment.expiresAt <= new Date()) {
    throw new AppError('The payment window has expired.', HTTP_STATUS.CONFLICT, 'PAYMENT_EXPIRED');
  }

  const signatureOk = razorpayService.verifyPaymentSignature({ orderId, paymentId, signature });
  if (!signatureOk) {
    throw new AppError('Payment verification failed.', HTTP_STATUS.BAD_REQUEST, 'INVALID_PAYMENT_SIGNATURE');
  }

  const remote = await razorpayService.fetchPayment(paymentId);
  const captured = remote.status === 'captured' || remote.status === 'authorized';
  if (!captured || remote.order_id !== orderId || remote.currency !== 'INR' || Number(remote.amount) !== payment.amount) {
    logger.warn('payment_amount_mismatch', { bookingId: String(booking._id), orderId });
    throw new AppError('Payment amount could not be verified.', HTTP_STATUS.CONFLICT, 'PAYMENT_AMOUNT_MISMATCH');
  }
  if (payment.amount !== expectedChargePaise(booking)) {
    logger.warn('payment_amount_mismatch', { bookingId: String(booking._id), orderId });
    throw new AppError('Payment amount could not be verified.', HTTP_STATUS.CONFLICT, 'PAYMENT_AMOUNT_MISMATCH');
  }

  booking.paymentStatus = 'PROCESSING';
  await booking.save();
  const result = await markPaid(payment, { paymentId, signature, method: remote.method || '' });
  const fresh = await Booking.findById(booking._id);
  return { booking: await presentBooking(fresh, user._id), alreadyPaid: result.alreadyPaid };
}

async function markFailed(orderId, reason) {
  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  if (!payment || payment.status === 'PAID') return;
  payment.status = 'FAILED';
  payment.failureReason = safeFailureReason(reason) || 'Payment failed';
  await payment.save();
  await Booking.updateOne(
    { _id: payment.booking, status: 'PAYMENT_REQUIRED', paymentStatus: { $ne: 'PAID' } },
    { $set: { paymentStatus: 'FAILED', paymentFailureReason: payment.failureReason } }
  );
  logger.info('payment_failed', { bookingId: String(payment.booking), orderId });
}

async function presentBooking(booking, viewerId) {
  const populated = await Booking.findById(booking._id).populate([
    { path: 'listing', select: 'title coverImage city' },
    { path: 'renter', select: 'name profileImage' },
    { path: 'owner', select: 'name profileImage' },
  ]);
  return toBooking(populated, viewerId);
}

async function getBookingPayment(user, bookingId) {
  assertBookingId(bookingId);
  await expirePayableBookings();
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND');
  const isRenter = String(booking.renter) === String(user._id);
  const isOwner = String(booking.owner) === String(user._id);
  if (!isRenter && !isOwner) {
    throw new AppError('You cannot view this payment.', HTTP_STATUS.FORBIDDEN, 'UNAUTHORIZED_PAYMENT_ACCESS');
  }
  const payment = await Payment.findOne({ booking: booking._id }).sort({ createdAt: -1 });
  const payload = {
    bookingId: String(booking._id),
    bookingStatus: booking.status,
    paymentStatus: booking.paymentStatus,
    amount: payment ? payment.amount : expectedChargePaise(booking),
    currency: 'INR',
    paidAt: booking.paymentCompletedAt || payment?.paidAt || null,
    paymentDueAt: booking.paymentDueAt,
    securityDeposit: rupeesToPaise(booking.securityDeposit),
    totalBeforeDeposit: rupeesToPaise(booking.totalBeforeDeposit),
    failureReason: isRenter ? (booking.paymentFailureReason || '') : '',
  };
  if (isRenter) payload.razorpayOrderId = booking.razorpayOrderId || payment?.razorpayOrderId || '';
  return payload;
}

module.exports = {
  expirePayableBookings,
  createOrder,
  verifyPayment,
  markPaid,
  markFailed,
  getBookingPayment,
  presentBooking,
};
