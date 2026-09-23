const { successResponse } = require('../utils/response');
const { MESSAGES } = require('../utils/constants');

const getReviews = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const createReview = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);

module.exports = { getReviews, createReview };
