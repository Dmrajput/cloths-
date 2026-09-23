const { successResponse } = require('../utils/response');
const { MESSAGES } = require('../utils/constants');

const getEarnings = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const requestPayout = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const getPayoutHistory = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);

module.exports = { getEarnings, requestPayout, getPayoutHistory };
