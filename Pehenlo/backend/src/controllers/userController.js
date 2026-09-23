const { successResponse } = require('../utils/response');
const { MESSAGES } = require('../utils/constants');

const getProfile = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const updateProfile = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const getUsers = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);

module.exports = { getProfile, updateProfile, getUsers };
