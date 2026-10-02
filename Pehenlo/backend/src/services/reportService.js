const mongoose = require('mongoose');
const Report = require('../models/Report');
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');
const { assertPlainText } = require('./moderationService');

const attempts = new Map();

function assertRate(userId) {
  const now = Date.now();
  const recent = (attempts.get(String(userId)) || []).filter((stamp) => now - stamp < 15 * 60 * 1000);
  if (recent.length >= 8) {
    throw new AppError('Please wait before submitting another report', HTTP_STATUS.TOO_MANY_REQUESTS, 'RATE_LIMITED');
  }
  recent.push(now);
  attempts.set(String(userId), recent);
}

async function assertTarget(reporterId, targetType, targetId) {
  if (!Report.REPORT_TARGETS.includes(targetType) || !mongoose.Types.ObjectId.isValid(targetId)) {
    throw new AppError('Report target is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_REPORT_TARGET');
  }
  if (targetType === 'LISTING') {
    const listing = await Listing.findById(targetId).select('owner status');
    if (!listing || listing.status === 'DRAFT') {
      throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND, 'INVALID_REPORT_TARGET');
    }
    if (String(listing.owner) === String(reporterId)) {
      throw new AppError('You cannot report your own listing', HTTP_STATUS.BAD_REQUEST, 'INVALID_REPORT_TARGET');
    }
    return { booking: null };
  }
  if (targetType === 'USER') {
    if (String(targetId) === String(reporterId)) {
      throw new AppError('You cannot report yourself', HTTP_STATUS.BAD_REQUEST, 'INVALID_REPORT_TARGET');
    }
    const user = await User.findById(targetId).select('_id');
    if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    return { booking: null };
  }
  if (targetType === 'REVIEW') {
    const review = await Review.findOne({ _id: targetId, status: 'PUBLISHED' }).select('reviewer booking');
    if (!review) throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
    if (String(review.reviewer) === String(reporterId)) {
      throw new AppError('You cannot report your own review', HTTP_STATUS.BAD_REQUEST, 'INVALID_REPORT_TARGET');
    }
    return { booking: review.booking || null, reviewId: review._id };
  }
  const booking = await Booking.findById(targetId).select('renter owner');
  if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND, 'INVALID_REPORT_TARGET');
  const involved = String(booking.renter) === String(reporterId) || String(booking.owner) === String(reporterId);
  if (!involved) throw new AppError('You cannot report this booking', HTTP_STATUS.FORBIDDEN, 'INVALID_REPORT_TARGET');
  return { booking: booking._id };
}

function present(report) {
  return {
    id: String(report._id),
    targetType: report.targetType,
    targetId: String(report.targetId),
    reason: report.reason,
    description: report.description || '',
    status: report.status,
    createdAt: report.createdAt,
  };
}

async function createReport(userId, body) {
  assertRate(userId);
  const reason = body?.reason;
  if (!Report.REPORT_REASONS.includes(reason)) {
    throw new AppError('Choose a report reason', HTTP_STATUS.BAD_REQUEST, 'INVALID_REPORT_TARGET');
  }
  const description = String(body?.description || '').replace(/\s+/g, ' ').trim();
  if (description.length > 1000) {
    throw new AppError('Description is too long', HTTP_STATUS.BAD_REQUEST, 'INVALID_REVIEW_CONTENT');
  }
  assertPlainText(description, 'Description');
  const targetType = body?.targetType;
  const targetId = body?.targetId;
  const link = await assertTarget(userId, targetType, targetId);
  const existing = await Report.findOne({
    reporter: userId,
    targetType,
    targetId,
    status: { $in: ['OPEN', 'UNDER_REVIEW'] },
  }).select('_id');
  if (existing) {
    throw new AppError('You already reported this', HTTP_STATUS.CONFLICT, 'REPORT_ALREADY_EXISTS');
  }
  if (link.reviewId) {
    await Review.updateOne({ _id: link.reviewId }, { $inc: { reportCount: 1 } });
  }
  const { notifyReportReceived } = require('./notificationService');
  const report = await Report.create({
    reporter: userId,
    targetType,
    targetId,
    booking: link.booking,
    reason,
    description,
    status: 'OPEN',
  });
  await notifyReportReceived(report);
  return present(report);
}

async function listMine(userId) {
  const rows = await Report.find({ reporter: userId }).sort({ createdAt: -1 }).limit(50).lean();
  return rows.map(present);
}

module.exports = { createReport, listMine };
