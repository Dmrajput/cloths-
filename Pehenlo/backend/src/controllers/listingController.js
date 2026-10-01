const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const { toPublicListing, toOwnerListing } = require('../utils/catalogPresenter');
const { HTTP_STATUS } = require('../utils/constants');
const { ACTIVE_FILTER, clampLimit, findActiveListings, searchActiveListings, findPublicListingById, findSimilarListings, recordListingView, DETAIL_POPULATE } = require('../services/catalogService');
const listingWriteService = require('../services/listingWriteService');
const { storeListingImage } = require('../services/listingImageService');

const GENDERS = {
  female: 'female',
  women: 'female',
  male: 'male',
  men: 'male',
  unisex: 'unisex',
  kids: 'kids',
};

const CONDITIONS = {
  excellent: 'excellent',
  good: 'good',
  fair: 'fair',
  new: 'excellent',
  like_new: 'excellent',
  used: 'fair',
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', 'Custom'];
const SIZE_LOOKUP = Object.fromEntries(SIZES.map((size) => [size.toLowerCase(), size]));

const OCCASIONS = ['wedding', 'navratri', 'engagement', 'haldi', 'mehendi', 'festival', 'reception', 'traditional-day'];
const SOURCES = new Set(['featured', 'trending', 'nearby', 'recent']);

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rejectObject(value, name) {
  if (value !== null && typeof value === 'object') {
    throw new AppError(`${name} is invalid`, HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }
}

function readString(value, name, { max = 80 } = {}) {
  if (value == null || value === '') return '';
  rejectObject(value, name);
  if (typeof value !== 'string') {
    throw new AppError(`${name} is invalid`, HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new AppError(`${name} is too long`, HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }
  return trimmed;
}

function readList(value, name) {
  if (value == null || value === '') return [];
  rejectObject(Array.isArray(value) ? null : value, name);
  const parts = Array.isArray(value) ? value : [value];
  if (parts.some((part) => typeof part !== 'string')) {
    throw new AppError(`${name} is invalid`, HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }
  return parts
    .flatMap((part) => part.split(','))
    .map((part) => part.trim())
    .filter(Boolean);
}

function readInt(value, name, { min, max, fallback }) {
  if (value == null || value === '') return fallback;
  rejectObject(value, name);
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new AppError(`${name} is invalid`, HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }
  const number = Number(value);
  if (number < min || number > max) {
    throw new AppError(`${name} is invalid`, HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }
  return number;
}

function readPrice(value, name) {
  if (value == null || value === '') return null;
  rejectObject(value, name);
  if (typeof value !== 'string' || !/^\d+(\.\d+)?$/.test(value)) {
    throw new AppError(`${name} is invalid`, HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }
  const number = Number(value);
  if (number < 0) {
    throw new AppError(`${name} is invalid`, HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }
  return number;
}

function normalizeSize(value) {
  return SIZE_LOOKUP[String(value).toLowerCase()] || null;
}

async function buildExploreFilter(req) {
  const filter = {};
  const search = readString(req.query.search, 'search');
  const occasion = readString(req.query.occasion, 'occasion', { max: 40 }).toLowerCase();
  const city = readString(req.query.city, 'city');
  const genderRaw = readString(req.query.gender, 'gender', { max: 20 }).toLowerCase();
  const minPrice = readPrice(req.query.minPrice, 'minPrice');
  const maxPrice = readPrice(req.query.maxPrice, 'maxPrice');
  const minRating = readPrice(req.query.minRating, 'minRating');
  const source = readString(req.query.source, 'source', { max: 20 }).toLowerCase();
  const categories = readList(req.query.category, 'category');
  const sizes = readList(req.query.size, 'size');
  const conditions = readList(req.query.condition, 'condition');

  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    throw new AppError('Minimum price cannot be greater than maximum price', HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }
  if (minRating != null && (minRating < 0 || minRating > 5)) {
    throw new AppError('minRating is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }
  if (source && !SOURCES.has(source)) {
    throw new AppError('source is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }
  if (occasion && !OCCASIONS.includes(occasion)) {
    throw new AppError('occasion is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
  }

  if (genderRaw) {
    const gender = GENDERS[genderRaw];
    if (!gender) throw new AppError('gender is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
    filter.gender = gender;
  }

  if (city) {
    filter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
  }

  if (minPrice != null || maxPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = minPrice;
    if (maxPrice != null) filter.price.$lte = maxPrice;
  }

  if (minRating != null) {
    filter.rating = { $gte: minRating };
  }

  if (sizes.length) {
    const normalized = sizes.map(normalizeSize);
    if (normalized.some((size) => !size)) {
      throw new AppError('size is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
    }
    filter.size = { $in: normalized };
  }

  if (conditions.length) {
    const normalized = conditions.map((value) => CONDITIONS[value.toLowerCase().replace(/\s+/g, '_')]);
    if (normalized.some((value) => !value)) {
      throw new AppError('condition is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
    }
    filter.condition = { $in: [...new Set(normalized)] };
  }

  if (categories.length) {
    const ids = [];
    const slugs = [];
    categories.forEach((value) => {
      if (mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value) {
        ids.push(value);
      } else {
        slugs.push(value.toLowerCase());
      }
    });
    const found = await Category.find({
      isActive: true,
      $or: [
        ...(slugs.length ? [{ slug: { $in: slugs } }] : []),
        ...(ids.length ? [{ _id: { $in: ids } }] : []),
      ],
    }).select('_id');
    if (found.length !== categories.length) {
      throw new AppError('category is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_QUERY');
    }
    filter.category = { $in: found.map((category) => category._id) };
  }

  const and = [];
  if (search) {
    // Phase 4 uses escaped case-insensitive regex. A text index can replace this
    // if search volume grows; user input is never passed to Mongo operators.
    const pattern = new RegExp(escapeRegex(search), 'i');
    const matchedCategories = await Category.find({
      isActive: true,
      name: pattern,
    }).select('_id');
    and.push({
      $or: [
        { title: pattern },
        { description: pattern },
        { city: pattern },
        ...(matchedCategories.length ? [{ category: { $in: matchedCategories.map((item) => item._id) } }] : []),
      ],
    });
  }

  if (occasion) {
    const pattern = new RegExp(escapeRegex(occasion.replace(/-/g, ' ')), 'i');
    const compact = new RegExp(escapeRegex(occasion), 'i');
    and.push({
      $or: [
        { title: pattern },
        { description: pattern },
        { title: compact },
        { description: compact },
      ],
    });
  }

  if (and.length === 1) {
    Object.assign(filter, and[0]);
  } else if (and.length > 1) {
    filter.$and = and;
  }

  if (source === 'featured') {
    filter.isFeatured = true;
  }

  return { filter, source };
}

const getListings = async (req, res, next) => {
  try {
    const page = readInt(req.query.page, 'page', { min: 1, max: 1000, fallback: 1 });
    const limit = readInt(req.query.limit, 'limit', { min: 1, max: 50, fallback: 20 });
    const sort = readString(req.query.sort, 'sort', { max: 30 }).toLowerCase();
    const allowedSorts = ['', 'recommended', 'newest', 'price_asc', 'price_desc', 'rating_desc', 'views_desc'];
    const safeSort = allowedSorts.includes(sort) ? (sort || 'recommended') : 'recommended';
    const { filter, source } = await buildExploreFilter(req);
    const result = await searchActiveListings({
      filter,
      sort: safeSort,
      source,
      page,
      limit,
    });
    return successResponse(res, result, 'Listings fetched successfully');
  } catch (error) {
    if (error instanceof AppError) return next(error);
    return next(new AppError('Unable to fetch listings', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'LISTINGS_FETCH_FAILED'));
  }
};

const getFeaturedListings = async (req, res, next) => {
  try {
    const listings = await findActiveListings({
      filter: { isFeatured: true },
      sort: { sortOrder: 1, createdAt: -1 },
      limit: clampLimit(req.query.limit),
    });
    return successResponse(res, { listings }, 'Featured listings');
  } catch (_error) {
    return next(new AppError('Unable to load listings', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'LISTINGS_FETCH_FAILED'));
  }
};

const getTrendingListings = async (req, res, next) => {
  try {
    const listings = await findActiveListings({
      sort: { favoriteCount: -1, viewCount: -1, rating: -1, createdAt: -1 },
      limit: clampLimit(req.query.limit),
    });
    return successResponse(res, { listings }, 'Trending listings');
  } catch (_error) {
    return next(new AppError('Unable to load listings', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'LISTINGS_FETCH_FAILED'));
  }
};

const getNearbyListings = async (req, res, next) => {
  try {
    const city = String(req.query.city || '').trim();
    if (!city) {
      return successResponse(res, { listings: [] }, 'Nearby listings');
    }

    const listings = await findActiveListings({
      filter: { city: new RegExp(`^${escapeRegex(city)}$`, 'i') },
      sort: { rating: -1, createdAt: -1 },
      limit: clampLimit(req.query.limit),
    });
    return successResponse(res, { listings }, 'Nearby listings');
  } catch (_error) {
    return next(new AppError('Unable to load listings', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'LISTINGS_FETCH_FAILED'));
  }
};

const getRecentListings = async (req, res, next) => {
  try {
    const listings = await findActiveListings({
      sort: { createdAt: -1 },
      limit: clampLimit(req.query.limit),
    });
    return successResponse(res, { listings }, 'Recent listings');
  } catch (_error) {
    return next(new AppError('Unable to load listings', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'LISTINGS_FETCH_FAILED'));
  }
};

function isObjectId(value) {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
}

const getListingById = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      throw new AppError('Listing id is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_LISTING_ID');
    }

    const listing = await findPublicListingById(req.params.id);
    if (!listing) {
      throw new AppError('This outfit is no longer available', HTTP_STATUS.NOT_FOUND, 'LISTING_NOT_FOUND');
    }

    const payload = toPublicListing(listing, { detailed: true });
    const ownerId = listing.owner?._id || listing.owner;
    payload.viewerIsOwner = Boolean(req.user && String(ownerId) === String(req.user._id));
    return successResponse(res, { listing: payload }, 'Listing fetched successfully');
  } catch (error) {
    return next(error);
  }
};

const getSimilarListings = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      throw new AppError('Listing id is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_LISTING_ID');
    }
    const listing = await Listing.findOne({ _id: req.params.id, ...ACTIVE_FILTER }).select('category gender city');
    if (!listing) {
      throw new AppError('This outfit is no longer available', HTTP_STATUS.NOT_FOUND, 'LISTING_NOT_FOUND');
    }
    const items = await findSimilarListings(listing);
    return successResponse(res, { items }, 'Similar listings');
  } catch (error) {
    return next(error);
  }
};

const trackListingView = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      throw new AppError('Listing id is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_LISTING_ID');
    }
    const listing = await Listing.findOne({ _id: req.params.id, ...ACTIVE_FILTER }).select('owner');
    if (!listing) {
      throw new AppError('This outfit is no longer available', HTTP_STATUS.NOT_FOUND, 'LISTING_NOT_FOUND');
    }
    const isOwner = req.user && String(listing.owner) === String(req.user._id);
    if (!isOwner) {
      const viewerKey = req.ip || req.socket?.remoteAddress || 'unknown';
      await recordListingView(listing._id, viewerKey);
    }
    return successResponse(res, null, 'View recorded');
  } catch (error) {
    return next(error);
  }
};

const getMyListing = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      throw new AppError('Listing id is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_LISTING_ID');
    }
    const listing = await Listing.findOne({ _id: req.params.id, owner: req.user._id }).populate(DETAIL_POPULATE);
    if (!listing) {
      throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND, 'LISTING_NOT_FOUND');
    }
    const payload = toOwnerListing(listing);
    payload.viewerIsOwner = true;
    return successResponse(res, { listing: payload }, 'Listing');
  } catch (error) {
    return next(error);
  }
};

const createListing = async (req, res, next) => {
  try {
    const listing = await listingWriteService.createDraft(req.user, req.body);
    return successResponse(res, { listing }, 'Listing created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await listingWriteService.updateOwnedListing(req.user, req.params.id, req.body);
    return successResponse(res, { listing }, 'Listing updated');
  } catch (error) {
    return next(error);
  }
};

const submitListing = async (req, res, next) => {
  try {
    const result = await listingWriteService.submitOwnedListing(req.user, req.params.id);
    return successResponse(res, result, 'Listing submitted for approval');
  } catch (error) {
    return next(error);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const listings = await listingWriteService.listMine(req.user);
    return successResponse(res, { listings }, 'Your listings');
  } catch (error) {
    return next(error);
  }
};

const getMyDrafts = async (req, res, next) => {
  try {
    const listings = await listingWriteService.listMyDrafts(req.user);
    return successResponse(res, { listings }, 'Your drafts');
  } catch (error) {
    return next(error);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    await listingWriteService.deleteOwnedListing(req.user, req.params.id);
    return successResponse(res, null, 'Listing deleted');
  } catch (error) {
    return next(error);
  }
};

const deleteListingImage = async (req, res, next) => {
  try {
    const listing = await listingWriteService.deleteOwnedImage(req.user, req.params.id, req.params.imageId);
    return successResponse(res, { listing }, 'Photo removed');
  } catch (error) {
    return next(error);
  }
};

const uploadListingImage = async (req, res, next) => {
  try {
    const image = await storeListingImage(req.file, req);
    return successResponse(res, { image }, 'Photo uploaded', HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getListings,
  getFeaturedListings,
  getTrendingListings,
  getNearbyListings,
  getRecentListings,
  getListingById,
  getSimilarListings,
  trackListingView,
  getMyListing,
  createListing,
  updateListing,
  submitListing,
  getMyListings,
  getMyDrafts,
  deleteListing,
  deleteListingImage,
  uploadListingImage,
};
