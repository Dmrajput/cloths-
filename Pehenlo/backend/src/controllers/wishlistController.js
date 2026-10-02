const { successResponse } = require('../utils/response');
const wishlistService = require('../services/wishlistService');

const getWishlist = async (req, res, next) => {
  try {
    const data = await wishlistService.list(req.user._id, req.query);
    return successResponse(res, data, 'Wishlist');
  } catch (error) {
    return next(error);
  }
};

const getWishlistIds = async (req, res, next) => {
  try {
    const listingIds = await wishlistService.ids(req.user._id);
    return successResponse(res, { listingIds }, 'Wishlist');
  } catch (error) {
    return next(error);
  }
};

const getWishlistCount = async (req, res, next) => {
  try {
    const count = await wishlistService.count(req.user._id);
    return successResponse(res, { count }, 'Wishlist');
  } catch (error) {
    return next(error);
  }
};

const checkWishlist = async (req, res, next) => {
  try {
    const data = await wishlistService.check(req.user._id, req.params.listingId);
    return successResponse(res, data, 'Wishlist');
  } catch (error) {
    return next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const data = await wishlistService.add(req.user._id, req.params.listingId);
    return successResponse(res, data, 'Saved to Wishlist');
  } catch (error) {
    return next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const data = await wishlistService.remove(req.user._id, req.params.listingId);
    return successResponse(res, data, 'Removed from Wishlist');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getWishlist,
  getWishlistIds,
  getWishlistCount,
  checkWishlist,
  addToWishlist,
  removeFromWishlist,
};
