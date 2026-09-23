const { successResponse } = require('../utils/response');
const { MESSAGES } = require('../utils/constants');

const getNotifications = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const markAsRead = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);

module.exports = { getNotifications, markAsRead };
