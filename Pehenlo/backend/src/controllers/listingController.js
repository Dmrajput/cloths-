const { successResponse } = require('../utils/response');
const { MESSAGES } = require('../utils/constants');

const getListings = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const createListing = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const getListingById = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const updateListing = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);

module.exports = { getListings, createListing, getListingById, updateListing };
