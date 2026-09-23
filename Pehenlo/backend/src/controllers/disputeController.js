const { successResponse } = require('../utils/response');
const { MESSAGES } = require('../utils/constants');

const getDisputes = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const createDispute = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const getDisputeById = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);

module.exports = { getDisputes, createDispute, getDisputeById };
