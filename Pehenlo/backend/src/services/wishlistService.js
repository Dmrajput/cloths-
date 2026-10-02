const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Listing = require('../models/Listing');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');

function assertId(listingId) {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND, 'LISTING_NOT_FOUND');
  }
}

function isBookable(listing) {
  return Boolean(listing && listing.isActive && listing.status === 'ACTIVE');
}

function toWishlistListing(listing) {
  if (!listing) {
    return {
      id: null,
      title: 'Outfit unavailable',
      coverImage: '',
      rentalPrice: null,
      rentalDuration: null,
      rating: null,
      reviewCount: 0,
      city: '',
      status: 'REMOVED',
      isActive: false,
      available: false,
    };
  }

  return {
    id: String(listing._id),
    title: listing.title,
    coverImage: listing.coverImage || '',
    rentalPrice: listing.price,
    rentalDuration: Number(listing.rentalDuration) > 1
      ? `${listing.rentalDuration} days`
      : '1 day',
    rating: listing.rating ?? null,
    reviewCount: listing.reviewCount || 0,
    city: listing.city || '',
    status: listing.status,
    isActive: Boolean(listing.isActive),
    available: isBookable(listing),
  };
}

async function add(userId, listingId) {
  assertId(listingId);
  const listing = await Listing.findById(listingId).select('_id status isActive');
  if (!listing) {
    throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND, 'LISTING_NOT_FOUND');
  }

  try {
    await Wishlist.create({ user: userId, listing: listingId });
    await Listing.updateOne({ _id: listingId }, { $inc: { favoriteCount: 1 } });
  } catch (error) {
    if (error?.code !== 11000) throw error;
  }

  return { isFavorite: true };
}

async function remove(userId, listingId) {
  assertId(listingId);
  const removed = await Wishlist.findOneAndDelete({ user: userId, listing: listingId });
  if (removed) {
    await Listing.updateOne(
      { _id: listingId, favoriteCount: { $gt: 0 } },
      { $inc: { favoriteCount: -1 } }
    );
  }
  return { isFavorite: false };
}

async function list(userId, query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const filter = { user: userId };
  const { blockedIds } = require('./userSafetyService');
  const blocked = await blockedIds(userId);
  if (blocked.length) {
    const hidden = await Listing.find({ owner: { $in: blocked } }).select('_id').lean();
    if (hidden.length) filter.listing = { $nin: hidden.map((item) => item._id) };
  }
  const [total, rows] = await Promise.all([
    Wishlist.countDocuments(filter),
    Wishlist.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'listing',
        select: 'title coverImage price rentalDuration rating reviewCount city status isActive',
      })
      .lean(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items: rows.map((row) => ({
      id: String(row._id),
      listing: toWishlistListing(row.listing),
      createdAt: row.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages && total > 0,
    },
  };
}

async function ids(userId) {
  const rows = await Wishlist.find({ user: userId }).select('listing').lean();
  return rows.map((row) => String(row.listing));
}

async function count(userId) {
  return Wishlist.countDocuments({ user: userId });
}

async function check(userId, listingId) {
  assertId(listingId);
  const exists = await Wishlist.exists({ user: userId, listing: listingId });
  return { isFavorite: Boolean(exists) };
}

module.exports = {
  add,
  remove,
  list,
  ids,
  count,
  check,
};
