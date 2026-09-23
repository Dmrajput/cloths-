const { successResponse } = require('../utils/response');
const { MESSAGES } = require('../utils/constants');

const register = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const login = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const logout = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);
const refreshToken = (_req, res) => successResponse(res, null, MESSAGES.NOT_IMPLEMENTED);

module.exports = { register, login, logout, refreshToken };
