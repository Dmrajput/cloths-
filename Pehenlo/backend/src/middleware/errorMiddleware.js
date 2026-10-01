const env = require('../config/env');
const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

const errorMiddleware = (err, _req, res, _next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || MESSAGES.SERVER_ERROR;
  let code = err.code || 'SERVER_ERROR';

  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    code = 'PROFILE_VALIDATION_ERROR';
  }

  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'An account with this phone already exists';
    code = 'CONFLICT';
  }

  if (statusCode >= 500) {
    logger.error(code, message);
  }

  if (env.NODE_ENV === 'production' && statusCode >= 500) {
    message = MESSAGES.SERVER_ERROR;
    code = 'SERVER_ERROR';
  }

  return errorResponse(res, message, statusCode, code);
};

module.exports = errorMiddleware;
