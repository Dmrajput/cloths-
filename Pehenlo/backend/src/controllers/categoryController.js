const { successResponse } = require('../utils/response');
const { MESSAGES } = require('../utils/constants');

const getCategories = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const createCategory = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const getCategoryById = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);

module.exports = { getCategories, createCategory, getCategoryById };
