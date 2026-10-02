const crypto = require('crypto');
const Earning = require('../models/Earning');
const PayoutAllocation = require('../models/PayoutAllocation');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../utils/constants');
const { isDateKey, utcToDateKey } = require('../utils/dateUtils');
const { calculateSellerEarning, settlementAvailableAt } = require('./earningCalculationService');
const { minimumPayoutAmount } = require('../config/commissionConfig');

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;
const STATUSES = ['PENDING', 'AVAILABLE', 'PAYOUT_PENDING', 'PAID', 'CANCELLED', 'ADJUSTED'];

function assertId(value) {
  if (typeof value !== 'string' || !OBJECT_ID.test(value)) {
    throw new AppError('Earning id is invalid', HTTP_STATUS.BAD_REQUEST, 'EARNING_NOT_FOUND');
  }
}

function maskMoney(booking) {
  return {
    rentalSubtotal: booking.rentalSubtotal,
    cleaningFee: booking.cleaningFee,
    deliveryFee: booking.deliveryFee,
    platformFee: booking.platformFee,
    securityDeposit: booking.securityDeposit,
  };
}

async function ensureRentalEarning(booking, payment) {
  if (!booking || booking.paymentStatus !== 'PAID') return null;
  const existing = await Earning.findOne({ booking: booking._id, earningType: 'RENTAL' });
  if (existing) return existing;

  const amounts = calculateSellerEarning(booking);
  const paidAt = booking.paymentCompletedAt || payment?.paidAt || new Date();
  const payload = {
    seller: booking.owner,
    owner: booking.owner,
    booking: booking._id,
    listing: booking.listing,
    payment: payment?._id || booking.paymentId || null,
    bookingReference: booking.bookingReference || '',
    earningType: 'RENTAL',
    ...maskMoney(booking),
    ...amounts,
    currency: 'INR',
    status: 'PENDING',
    availableAt: settlementAvailableAt(paidAt),
    description: booking.listingTitle || booking.listingSnapshot?.title || 'Outfit rental',
  };

  try {
    const created = await Earning.create(payload);
    logger.info('earning_created', { bookingId: String(booking._id), earningId: String(created._id) });
    const { notifyEarningCreated } = require('./notificationService');
    await notifyEarningCreated(created);
    return created;
  } catch (error) {
    if (error.code === 11000) return Earning.findOne({ booking: booking._id, earningType: 'RENTAL' });
    throw error;
  }
}

async function backfillConfirmedBookings(sellerId) {
  const bookings = await Booking.find({
    owner: sellerId,
    paymentStatus: 'PAID',
    status: { $in: ['CONFIRMED', 'ACTIVE', 'RETURN_PENDING', 'COMPLETED'] },
  }).limit(40);
  await Promise.all(bookings.map(async (booking) => {
    const payment = booking.paymentId ? await Payment.findById(booking.paymentId) : null;
    await ensureRentalEarning(booking, payment);
  }));
}

async function releaseEligible(sellerId) {
  const due = await Earning.find({
    seller: sellerId,
    status: 'PENDING',
    availableAt: { $lte: new Date() },
  }).select('_id seller booking');
  if (!due.length) return;
  await Earning.updateMany(
    { _id: { $in: due.map((item) => item._id) }, status: 'PENDING' },
    { $set: { status: 'AVAILABLE' } }
  );
  const { notifyEarningAvailable } = require('./notificationService');
  await Promise.all(due.map((earning) => notifyEarningAvailable(earning)));
}

async function prepareSeller(sellerId) {
  await backfillConfirmedBookings(sellerId);
  await releaseEligible(sellerId);
}

function presentEarning(earning, booking, listing) {
  const outfitTitle = earning.description
    || booking?.listingSnapshot?.title
    || booking?.listingTitle
    || listing?.title
    || 'Outfit';
  return {
    id: String(earning._id),
    bookingId: String(earning.booking?._id || earning.booking),
    bookingReference: earning.bookingReference || booking?.bookingReference || '',
    outfitTitle,
    coverImage: booking?.listingSnapshot?.coverImage || booking?.listingCoverImage || listing?.coverImage || '',
    startDate: booking?.startDate ? utcToDateKey(booking.startDate) : '',
    endDate: booking?.endDate ? utcToDateKey(booking.endDate) : '',
    rentalSubtotal: earning.rentalSubtotal,
    cleaningFee: earning.cleaningFee,
    deliveryFee: earning.deliveryFee,
    platformFee: earning.platformFee,
    securityDeposit: earning.securityDeposit,
    grossRentalAmount: earning.grossRentalAmount,
    commissionRate: earning.commissionRate,
    commissionAmount: earning.commissionAmount,
    otherAdjustments: earning.otherAdjustments,
    netEarning: earning.netEarning,
    currency: earning.currency || 'INR',
    status: earning.status,
    availableAt: earning.availableAt,
    paidAt: earning.paidAt,
    payoutReference: earning.payoutReference || '',
    customerTotal: (earning.rentalSubtotal || 0)
      + (earning.cleaningFee || 0)
      + (earning.deliveryFee || 0)
      + (earning.platformFee || 0)
      + (earning.securityDeposit || 0),
  };
}

async function summary(user) {
  await prepareSeller(user._id);
  const rows = await Earning.aggregate([
    { $match: { seller: user._id, status: { $ne: 'CANCELLED' } } },
    {
      $group: {
        _id: '$status',
        gross: { $sum: '$grossRentalAmount' },
        commission: { $sum: '$commissionAmount' },
        net: { $sum: '$netEarning' },
      },
    },
  ]);
  const byStatus = Object.fromEntries(rows.map((row) => [row._id, row]));
  const total = (key) => rows.reduce((sum, row) => sum + (row[key] || 0), 0);
  const net = (status) => byStatus[status]?.net || 0;
  const reservedRows = await PayoutAllocation.aggregate([
    { $match: { seller: user._id } },
    { $lookup: { from: 'payouts', localField: 'payout', foreignField: '_id', as: 'payout' } },
    { $unwind: '$payout' },
    { $match: { 'payout.status': { $in: ['REQUESTED', 'PROCESSING'] } } },
    { $lookup: { from: 'earnings', localField: 'earning', foreignField: '_id', as: 'earning' } },
    { $unwind: '$earning' },
    { $match: { 'earning.status': 'AVAILABLE' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const reservedOnAvailable = reservedRows[0]?.total || 0;
  const paidRows = await PayoutAllocation.aggregate([
    { $match: { seller: user._id } },
    { $lookup: { from: 'payouts', localField: 'payout', foreignField: '_id', as: 'payout' } },
    { $unwind: '$payout' },
    { $match: { 'payout.status': 'PAID' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return {
    currency: 'INR',
    totalGross: total('gross'),
    totalCommission: total('commission'),
    totalNet: total('net'),
    pendingAmount: net('PENDING'),
    availableAmount: Math.max(0, net('AVAILABLE') - reservedOnAvailable),
    payoutPendingAmount: net('PAYOUT_PENDING') + reservedOnAvailable,
    paidAmount: paidRows[0]?.total || net('PAID'),
    minimumPayoutAmount: minimumPayoutAmount(),
  };
}

async function listEarnings(user, query) {
  await prepareSeller(user._id);
  const page = Number(query?.page || 1);
  const limit = Number(query?.limit || 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new AppError('Page or limit is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  const status = query?.status && query.status !== 'ALL' ? query.status : '';
  if (status && !STATUSES.includes(status)) {
    throw new AppError('Status is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  const filter = { seller: user._id };
  if (status) filter.status = status;
  if (query?.fromDate || query?.toDate) {
    filter.createdAt = {};
    if (query.fromDate) {
      if (!isDateKey(query.fromDate)) throw new AppError('Date is invalid', HTTP_STATUS.BAD_REQUEST, 'DATES_INVALID');
      filter.createdAt.$gte = new Date(`${query.fromDate}T00:00:00+05:30`);
    }
    if (query.toDate) {
      if (!isDateKey(query.toDate)) throw new AppError('Date is invalid', HTTP_STATUS.BAD_REQUEST, 'DATES_INVALID');
      filter.createdAt.$lte = new Date(`${query.toDate}T23:59:59.999+05:30`);
    }
  }
  const totalCount = await Earning.countDocuments(filter);
  const items = await Earning.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({ path: 'booking', select: 'bookingReference listingTitle listingCoverImage listingSnapshot startDate endDate' })
    .populate({ path: 'listing', select: 'title coverImage' });
  const totalPages = Math.ceil(totalCount / limit) || 0;
  return {
    earnings: items.map((item) => presentEarning(item, item.booking, item.listing)),
    pagination: { page, limit, total: totalCount, totalPages, hasNextPage: page < totalPages },
  };
}

async function getEarning(user, earningId) {
  assertId(earningId);
  await prepareSeller(user._id);
  const earning = await Earning.findById(earningId)
    .populate({ path: 'booking', select: 'bookingReference listingTitle listingCoverImage listingSnapshot startDate endDate owner' })
    .populate({ path: 'listing', select: 'title coverImage' });
  if (!earning) throw new AppError('Earning not found', HTTP_STATUS.NOT_FOUND, 'EARNING_NOT_FOUND');
  if (String(earning.seller) !== String(user._id)) {
    throw new AppError('You cannot view this earning.', HTTP_STATUS.FORBIDDEN, 'UNAUTHORIZED_EARNING_ACCESS');
  }
  return presentEarning(earning, earning.booking, earning.listing);
}

async function sellerEarningForBooking(bookingId, sellerId) {
  const earning = await Earning.findOne({ booking: bookingId, seller: sellerId, earningType: 'RENTAL' });
  if (!earning) return null;
  return {
    id: String(earning._id),
    grossRentalAmount: earning.grossRentalAmount,
    commissionAmount: earning.commissionAmount,
    netEarning: earning.netEarning,
    securityDeposit: earning.securityDeposit,
    status: earning.status,
    availableAt: earning.availableAt,
  };
}

function referenceToken() {
  const year = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(new Date());
  return `PO-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

module.exports = {
  ensureRentalEarning,
  prepareSeller,
  summary,
  listEarnings,
  getEarning,
  sellerEarningForBooking,
  presentEarning,
  referenceToken,
};
