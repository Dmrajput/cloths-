const { errorResponse } = require('../utils/response');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

// Placeholder auth middleware — replace with JWT verification later.
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return errorResponse(res, MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  // TODO: verify JWT and attach user to req.user
  next();
};

module.exports = authMiddleware;
