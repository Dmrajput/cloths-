const { successResponse } = require('../utils/response');
const { MESSAGES } = require('../utils/constants');

const getWishlist = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const addToWishlist = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const removeFromWishlist = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
