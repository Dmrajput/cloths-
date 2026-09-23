const { errorResponse } = require('../utils/response');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const logger = require('../utils/logger');

const errorMiddleware = (err, _req, res, _next) => {
  logger.error(err.message || err);

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || MESSAGES.SERVER_ERROR;

  return errorResponse(res, message, statusCode);
};

module.exports = errorMiddleware;
