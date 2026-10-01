const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');

const authMiddleware = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

    if (!token) {
      throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Session expired', HTTP_STATUS.UNAUTHORIZED, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid session', HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN');
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    }

    if (!user.isActive) {
      throw new AppError('This account is not active', HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authMiddleware;
