const mongoose = require('mongoose');
const User = require('../models/User');
const UserBlock = require('../models/UserBlock');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');
const { ownerSummary, publicName } = require('./reviewService');

const attempts = new Map();

function assertRate(userId) {
  const now = Date.now();
  const recent = (attempts.get(String(userId)) || []).filter((stamp) => now - stamp < 15 * 60 * 1000);
  if (recent.length >= 20) {
    throw new AppError('Please wait before blocking another account', HTTP_STATUS.TOO_MANY_REQUESTS, 'RATE_LIMITED');
  }
  recent.push(now);
  attempts.set(String(userId), recent);
}

async function blockedIds(userId) {
  const rows = await UserBlock.find({ blocker: userId }).select('blocked').lean();
  return rows.map((row) => row.blocked);
}

async function blockUser(userId, targetId) {
  assertRate(userId);
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  }
  if (String(userId) === String(targetId)) {
    throw new AppError('You cannot block yourself', HTTP_STATUS.BAD_REQUEST, 'CANNOT_BLOCK_SELF');
  }
  const user = await User.findById(targetId).select('_id isActive');
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  try {
    await UserBlock.create({ blocker: userId, blocked: targetId });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError('This account is already blocked', HTTP_STATUS.CONFLICT, 'USER_ALREADY_BLOCKED');
    }
    throw error;
  }
  return { blocked: true };
}

async function unblockUser(userId, targetId) {
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_BLOCKED');
  }
  const removed = await UserBlock.findOneAndDelete({ blocker: userId, blocked: targetId });
  if (!removed) throw new AppError('This account is not blocked', HTTP_STATUS.NOT_FOUND, 'USER_NOT_BLOCKED');
  return { blocked: false };
}

async function listBlocked(userId) {
  const rows = await UserBlock.find({ blocker: userId })
    .sort({ createdAt: -1 })
    .populate('blocked', 'name profileImage')
    .lean();
  return rows.map((row) => ({
    id: String(row.blocked?._id || row.blocked),
    name: publicName(row.blocked?.name),
    profileImage: row.blocked?.profileImage || '',
    blockedAt: row.createdAt,
  }));
}

async function publicProfile(userId, viewerId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  }
  const user = await User.findById(userId).select('name profileImage city createdAt isActive');
  if (!user || !user.isActive) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  if (viewerId && String(viewerId) !== String(userId)) {
    const blocked = await UserBlock.exists({ blocker: viewerId, blocked: userId });
    if (blocked) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  }
  const [rating, completedRentalCount, activeListingCount] = await Promise.all([
    ownerSummary(userId),
    Booking.countDocuments({ owner: userId, status: 'COMPLETED', paymentStatus: 'PAID' }),
    Listing.countDocuments({ owner: userId, status: 'ACTIVE', isActive: true }),
  ]);
  const listings = await Listing.find({ owner: userId, status: 'ACTIVE', isActive: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .select('title coverImage price rentalDuration city rating reviewCount')
    .lean();
  return {
    id: String(user._id),
    name: publicName(user.name),
    profileImage: user.profileImage || '',
    city: user.city || '',
    memberSince: user.createdAt,
    ownerRating: rating.averageRating,
    reviewCount: rating.reviewCount,
    completedRentalCount,
    activeListingCount,
    listings: listings.map((listing) => ({
      id: String(listing._id),
      title: listing.title,
      coverImage: listing.coverImage || '',
      price: listing.price,
      city: listing.city || '',
      rating: listing.rating || 0,
      reviewCount: listing.reviewCount || 0,
    })),
  };
}

module.exports = {
  blockedIds,
  blockUser,
  unblockUser,
  listBlocked,
  publicProfile,
};
