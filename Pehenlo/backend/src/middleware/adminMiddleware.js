const { errorResponse } = require('../utils/response');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

// Placeholder admin middleware — replace with role check later.
const adminMiddleware = (_req, res, next) => {
  // TODO: verify req.user.role === 'admin'
  return errorResponse(res, MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
};

module.exports = adminMiddleware;
