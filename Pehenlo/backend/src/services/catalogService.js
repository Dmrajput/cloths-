const Listing = require('../models/Listing');
const { toPublicListing } = require('../utils/catalogPresenter');

const ACTIVE_FILTER = { status: 'ACTIVE', isActive: true };
const HOME_LIMIT = 6;

const LISTING_POPULATE = [
  { path: 'category', select: 'name slug' },
  { path: 'owner', select: 'name profileImage' },
];

function clampLimit(value, fallback = HOME_LIMIT) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 1), 10);
}

async function findActiveListings({ filter = {}, sort = { createdAt: -1 }, limit = HOME_LIMIT, detailed = false } = {}) {
  const listings = await Listing.find({ ...ACTIVE_FILTER, ...filter })
    .sort(sort)
    .limit(limit)
    .populate(LISTING_POPULATE);

  return listings.map((listing) => toPublicListing(listing, { detailed }));
}

const SORTS = {
  recommended: { isFeatured: -1, rating: -1, reviewCount: -1, viewCount: -1, favoriteCount: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  price_asc: { price: 1, createdAt: -1 },
  price_desc: { price: -1, createdAt: -1 },
  rating_desc: { rating: -1, reviewCount: -1, createdAt: -1 },
  views_desc: { viewCount: -1, createdAt: -1 },
};

async function searchActiveListings({ filter, sort = 'recommended', source, page = 1, limit = 20 }) {
  let sortSpec = SORTS[sort] || SORTS.recommended;
  if (source === 'trending' && sort === 'recommended') {
    sortSpec = { favoriteCount: -1, viewCount: -1, rating: -1, createdAt: -1 };
  }
  if (source === 'recent' && sort === 'recommended') {
    sortSpec = SORTS.newest;
  }

  const query = { ...ACTIVE_FILTER, ...filter };
  const total = await Listing.countDocuments(query);
  const skip = (page - 1) * limit;
  const listings = await Listing.find(query)
    .sort(sortSpec)
    .skip(skip)
    .limit(limit)
    .populate(LISTING_POPULATE);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    items: listings.map((listing) => toPublicListing(listing)),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
}

const DETAIL_POPULATE = [
  { path: 'category', select: 'name slug' },
  { path: 'owner', select: 'name profileImage createdAt' },
];

const recentViews = new Map();
const VIEW_WINDOW_MS = 30 * 60 * 1000;

async function findPublicListingById(listingId) {
  return Listing.findOne({ _id: listingId, ...ACTIVE_FILTER }).populate(DETAIL_POPULATE);
}

async function findSimilarListings(listing) {
  const categoryId = listing.category?._id || listing.category;
  const base = {
    ...ACTIVE_FILTER,
    _id: { $ne: listing._id },
    category: categoryId,
  };
  const sameCity = listing.city
    ? await Listing.find({ ...base, city: listing.city }).sort({ rating: -1, createdAt: -1 }).limit(6).populate(LISTING_POPULATE)
    : [];
  if (sameCity.length >= 6) {
    return sameCity.map((item) => toPublicListing(item));
  }
  const excluded = sameCity.map((item) => item._id);
  const more = await Listing.find({ ...base, _id: { $nin: [listing._id, ...excluded] } })
    .sort({ rating: -1, createdAt: -1 })
    .limit(6 - sameCity.length)
    .populate(LISTING_POPULATE);
  return [...sameCity, ...more].map((item) => toPublicListing(item));
}

async function recordListingView(listingId, viewerKey) {
  const key = `${viewerKey}:${String(listingId)}`;
  const now = Date.now();
  const last = recentViews.get(key) || 0;
  if (now - last < VIEW_WINDOW_MS) return false;
  recentViews.set(key, now);
  if (recentViews.size > 5000) {
    for (const [entryKey, seenAt] of recentViews) {
      if (now - seenAt > VIEW_WINDOW_MS) recentViews.delete(entryKey);
    }
  }
  await Listing.updateOne({ _id: listingId, ...ACTIVE_FILTER }, { $inc: { viewCount: 1 } });
  return true;
}

module.exports = {
  ACTIVE_FILTER,
  HOME_LIMIT,
  DETAIL_POPULATE,
  clampLimit,
  findActiveListings,
  searchActiveListings,
  findPublicListingById,
  findSimilarListings,
  recordListingView,
  SORTS,
};
