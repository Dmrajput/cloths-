const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');
const reviewService = require('../services/reviewService');

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user._id, req.body || {});
    return successResponse(res, { review }, 'Review submitted', HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

const getReview = async (req, res, next) => {
  try {
    const review = await reviewService.getReview(req.user?._id, req.params.reviewId);
    return successResponse(res, { review }, 'Review');
  } catch (error) {
    return next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(req.user._id, req.params.reviewId, req.body || {});
    return successResponse(res, { review }, 'Review updated');
  } catch (error) {
    return next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const data = await reviewService.deleteReview(req.user._id, req.params.reviewId);
    return successResponse(res, data, 'Review deleted');
  } catch (error) {
    return next(error);
  }
};

const getListingReviews = async (req, res, next) => {
  try {
    const data = await reviewService.listListingReviews(req.params.id, req.query);
    return successResponse(res, data, 'Reviews');
  } catch (error) {
    return next(error);
  }
};

const getListingReviewSummary = async (req, res, next) => {
  try {
    const summary = await reviewService.listingSummary(req.params.id);
    return successResponse(res, summary, 'Review summary');
  } catch (error) {
    return next(error);
  }
};

const getUserReviews = async (req, res, next) => {
  try {
    const data = await reviewService.listOwnerReviews(req.params.userId, req.query);
    return successResponse(res, data, 'Reviews');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createReview,
  getReview,
  updateReview,
  deleteReview,
  getListingReviews,
  getListingReviewSummary,
  getUserReviews,
};
