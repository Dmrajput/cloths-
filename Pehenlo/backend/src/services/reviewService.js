const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');
const { needsModeration, assertPlainText } = require('./moderationService');

const TYPES = Review.REVIEW_TYPES;
const LOCKED_FIELDS = ['booking', 'bookingId', 'reviewer', 'reviewee', 'type', 'listing', 'status', 'isVerifiedRental', 'publishedAt', 'hiddenAt', 'reportCount'];
const attempts = new Map();

function assertId(value, code = 'REVIEW_NOT_FOUND') {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError('Not found', HTTP_STATUS.NOT_FOUND, code);
  }
}

function publicName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Pehenlo member';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
}

function cleanText(value, max) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function assertRate(userId) {
  const now = Date.now();
  const recent = (attempts.get(String(userId)) || []).filter((stamp) => now - stamp < 15 * 60 * 1000);
  if (recent.length >= 12) {
    throw new AppError('Please wait before submitting another review', HTTP_STATUS.TOO_MANY_REQUESTS, 'RATE_LIMITED');
  }
  recent.push(now);
  attempts.set(String(userId), recent);
}

function readRating(value, required) {
  if (value == null || value === '') {
    if (required) throw new AppError('Choose a rating from 1 to 5', HTTP_STATUS.BAD_REQUEST, 'INVALID_RATING');
    return undefined;
  }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) {
    throw new AppError('Choose a rating from 1 to 5', HTTP_STATUS.BAD_REQUEST, 'INVALID_RATING');
  }
  return value;
}

function readContent(body, { ratingRequired, rejectLocked = false }) {
  if (rejectLocked) {
    LOCKED_FIELDS.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(body || {}, field)) {
        throw new AppError('This part of the review cannot be changed', HTTP_STATUS.BAD_REQUEST, 'INVALID_REVIEW_CONTENT');
      }
    });
  }
  const title = cleanText(body?.title, 100);
  const comment = cleanText(body?.comment, 1000);
  if (String(body?.title || '').trim().length > 100 || String(body?.comment || '').trim().length > 1000) {
    throw new AppError('Review text is too long', HTTP_STATUS.BAD_REQUEST, 'INVALID_REVIEW_CONTENT');
  }
  assertPlainText(title, 'Title');
  assertPlainText(comment, 'Review');
  return {
    rating: readRating(body?.rating, ratingRequired),
    title,
    comment,
  };
}

function publication(title, comment) {
  const flagged = needsModeration(`${title} ${comment}`);
  return flagged
    ? { status: 'PENDING_MODERATION', publishedAt: null }
    : { status: 'PUBLISHED', publishedAt: new Date() };
}

async function loadBooking(bookingId) {
  assertId(bookingId, 'BOOKING_NOT_FOUND');
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND');
  return booking;
}

function relationship(booking, userId, type) {
  const isRenter = String(booking.renter) === String(userId);
  const isOwner = String(booking.owner) === String(userId);
  if (!isRenter && !isOwner) {
    throw new AppError('You cannot review this booking', HTTP_STATUS.FORBIDDEN, 'UNAUTHORIZED_REVIEW_ACCESS');
  }
  if (String(booking.renter) === String(booking.owner)) {
    throw new AppError('You cannot review this booking', HTTP_STATUS.FORBIDDEN, 'REVIEW_NOT_ALLOWED');
  }
  if (!TYPES.includes(type)) {
    throw new AppError('Review type is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_REVIEW_CONTENT');
  }
  if ((type === 'OUTFIT_REVIEW' || type === 'OWNER_REVIEW') && !isRenter) {
    throw new AppError('Only the renter can leave this review', HTTP_STATUS.FORBIDDEN, 'REVIEW_NOT_ALLOWED');
  }
  if (type === 'RENTER_REVIEW' && !isOwner) {
    throw new AppError('Only the outfit owner can leave this review', HTTP_STATUS.FORBIDDEN, 'REVIEW_NOT_ALLOWED');
  }
  if (booking.status !== 'COMPLETED' || booking.paymentStatus !== 'PAID') {
    throw new AppError('Reviews are available after a completed paid rental', HTTP_STATUS.FORBIDDEN, 'REVIEW_NOT_ALLOWED');
  }
  const reviewer = userId;
  const reviewee = type === 'RENTER_REVIEW' ? booking.renter : booking.owner;
  if (String(reviewer) === String(reviewee)) {
    throw new AppError('You cannot review yourself', HTTP_STATUS.FORBIDDEN, 'REVIEW_NOT_ALLOWED');
  }
  return { reviewer, reviewee, listing: booking.listing };
}

async function canUserReviewBooking({ userId, bookingId, reviewType }) {
  const booking = await loadBooking(bookingId);
  relationship(booking, userId, reviewType);
  const existing = await Review.findOne({ booking: booking._id, reviewer: userId, type: reviewType, status: { $ne: 'DELETED' } });
  return { allowed: !existing, booking };
}

function serializeMine(review) {
  if (!review) return null;
  return {
    id: String(review._id),
    type: review.type,
    rating: review.rating,
    title: review.title || '',
    comment: review.comment || '',
    status: review.status,
    isVerifiedRental: Boolean(review.isVerifiedRental),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function serializePublic(review) {
  const reviewer = review.reviewer && review.reviewer._id ? review.reviewer : null;
  return {
    id: String(review._id),
    type: review.type,
    rating: review.rating,
    title: review.title || '',
    comment: review.comment || '',
    isVerifiedRental: Boolean(review.isVerifiedRental),
    createdAt: review.createdAt,
    reviewer: {
      name: publicName(reviewer?.name),
      profileImage: reviewer?.profileImage || '',
    },
  };
}

async function recalculateListingRating(listingId) {
  if (!listingId) return;
  const rows = await Review.aggregate([
    { $match: { listing: new mongoose.Types.ObjectId(String(listingId)), type: 'OUTFIT_REVIEW', status: 'PUBLISHED' } },
    { $group: { _id: null, count: { $sum: 1 }, sum: { $sum: '$rating' } } },
  ]);
  const count = rows[0]?.count || 0;
  const average = count ? Math.round((rows[0].sum / count) * 100) / 100 : 0;
  await Listing.updateOne({ _id: listingId }, { $set: { rating: average, reviewCount: count } });
}

async function createReview(userId, body) {
  const content = readContent(body, { ratingRequired: true });
  const type = body?.type;
  const booking = await loadBooking(body?.bookingId);
  const link = relationship(booking, userId, type);
  assertRate(userId);
  const state = publication(content.title, content.comment);
  try {
    const review = await Review.create({
      reviewer: link.reviewer,
      reviewee: link.reviewee,
      booking: booking._id,
      listing: link.listing,
      type,
      rating: content.rating,
      title: content.title,
      comment: content.comment,
      status: state.status,
      isVerifiedRental: true,
      publishedAt: state.publishedAt,
    });
    if (type === 'OUTFIT_REVIEW') await recalculateListingRating(link.listing);
    const { notifyReviewReceived } = require('./notificationService');
    await notifyReviewReceived(review);
    return serializeMine(review);
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError('You already reviewed this rental', HTTP_STATUS.CONFLICT, 'REVIEW_ALREADY_EXISTS');
    }
    throw error;
  }
}

async function updateReview(userId, reviewId, body) {
  assertRate(userId);
  assertId(reviewId);
  const content = readContent(body, { ratingRequired: false, rejectLocked: true });
  const review = await Review.findById(reviewId);
  if (!review || review.status === 'DELETED') {
    throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
  }
  if (String(review.reviewer) !== String(userId)) {
    throw new AppError('You cannot edit this review', HTTP_STATUS.FORBIDDEN, 'UNAUTHORIZED_REVIEW_ACCESS');
  }
  if (content.rating != null) review.rating = content.rating;
  if (body?.title != null) review.title = content.title;
  if (body?.comment != null) review.comment = content.comment;
  const state = publication(review.title, review.comment);
  review.status = state.status;
  review.publishedAt = state.publishedAt;
  await review.save();
  if (review.type === 'OUTFIT_REVIEW') await recalculateListingRating(review.listing);
  const { notifyReviewReceived } = require('./notificationService');
  await notifyReviewReceived(review);
  return serializeMine(review);
}

async function deleteReview(userId, reviewId) {
  assertId(reviewId);
  const review = await Review.findById(reviewId);
  if (!review || review.status === 'DELETED') {
    throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
  }
  if (String(review.reviewer) !== String(userId)) {
    throw new AppError('You cannot delete this review', HTTP_STATUS.FORBIDDEN, 'UNAUTHORIZED_REVIEW_ACCESS');
  }
  review.status = 'DELETED';
  review.hiddenAt = new Date();
  await review.save();
  if (review.type === 'OUTFIT_REVIEW') await recalculateListingRating(review.listing);
  return { deleted: true };
}

async function getReview(userId, reviewId) {
  assertId(reviewId);
  const review = await Review.findById(reviewId).populate('reviewer', 'name profileImage');
  if (!review || review.status === 'DELETED') {
    throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
  }
  const mine = userId && String(review.reviewer?._id || review.reviewer) === String(userId);
  if (review.status !== 'PUBLISHED' && !mine) {
    throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
  }
  return mine ? serializeMine(review) : serializePublic(review);
}

async function listListingReviews(listingId, query) {
  assertId(listingId, 'LISTING_NOT_FOUND');
  const listing = await Listing.findById(listingId).select('_id');
  if (!listing) throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND, 'LISTING_NOT_FOUND');
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const filter = { listing: listingId, type: 'OUTFIT_REVIEW', status: 'PUBLISHED' };
  if (query.rating) {
    const rating = Number(query.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new AppError('Rating filter is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_RATING');
    }
    filter.rating = rating;
  }
  const sort = query.sort === 'highest'
    ? { rating: -1, createdAt: -1 }
    : query.sort === 'lowest'
      ? { rating: 1, createdAt: -1 }
      : { createdAt: -1 };
  const [total, rows] = await Promise.all([
    Review.countDocuments(filter),
    Review.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('reviewer', 'name profileImage')
      .lean(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  return {
    items: rows.map(serializePublic),
    pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages && total > 0 },
  };
}

async function listingSummary(listingId) {
  assertId(listingId, 'LISTING_NOT_FOUND');
  const rows = await Review.aggregate([
    { $match: { listing: new mongoose.Types.ObjectId(String(listingId)), type: 'OUTFIT_REVIEW', status: 'PUBLISHED' } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let count = 0;
  let sum = 0;
  rows.forEach((row) => {
    distribution[row._id] = row.count;
    count += row.count;
    sum += row._id * row.count;
  });
  return {
    averageRating: count ? Math.round((sum / count) * 100) / 100 : 0,
    reviewCount: count,
    distribution,
  };
}

async function ownerSummary(userId) {
  const rows = await Review.aggregate([
    { $match: { reviewee: new mongoose.Types.ObjectId(String(userId)), type: 'OWNER_REVIEW', status: 'PUBLISHED' } },
    { $group: { _id: null, count: { $sum: 1 }, sum: { $sum: '$rating' } } },
  ]);
  const count = rows[0]?.count || 0;
  return {
    averageRating: count ? Math.round((rows[0].sum / count) * 100) / 100 : 0,
    reviewCount: count,
  };
}

async function listOwnerReviews(userId, query) {
  assertId(userId, 'USER_NOT_FOUND');
  const user = await User.findById(userId).select('_id');
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const filter = { reviewee: userId, type: 'OWNER_REVIEW', status: 'PUBLISHED' };
  const [total, rows] = await Promise.all([
    Review.countDocuments(filter),
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('reviewer', 'name profileImage')
      .lean(),
  ]);
  return {
    items: rows.map(serializePublic),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit) || 1),
      hasNextPage: page * limit < total,
    },
  };
}

async function renterReputation(renterId) {
  const [completedRentals, positiveReviews] = await Promise.all([
    Booking.countDocuments({ renter: renterId, status: 'COMPLETED', paymentStatus: 'PAID' }),
    Review.countDocuments({ reviewee: renterId, type: 'RENTER_REVIEW', status: 'PUBLISHED', rating: { $gte: 4 } }),
  ]);
  return { completedRentals, positiveReviews };
}

async function stateForBooking(userId, booking) {
  const isRenter = String(booking.renter) === String(userId);
  const isOwner = String(booking.owner) === String(userId);
  const eligible = booking.status === 'COMPLETED' && booking.paymentStatus === 'PAID' && String(booking.renter) !== String(booking.owner);
  const mine = await Review.find({
    booking: booking._id,
    reviewer: userId,
    status: { $ne: 'DELETED' },
  }).lean();
  const byType = (type) => serializeMine(mine.find((item) => item.type === type));
  return {
    eligible,
    outfit: isRenter ? byType('OUTFIT_REVIEW') : null,
    owner: isRenter ? byType('OWNER_REVIEW') : null,
    renter: isOwner ? byType('RENTER_REVIEW') : null,
    renterReputation: isOwner ? await renterReputation(booking.renter) : null,
  };
}

module.exports = {
  canUserReviewBooking,
  createReview,
  updateReview,
  deleteReview,
  getReview,
  listListingReviews,
  listingSummary,
  ownerSummary,
  listOwnerReviews,
  stateForBooking,
  recalculateListingRating,
  publicName,
};
