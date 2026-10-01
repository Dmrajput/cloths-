const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');

const validationMiddleware = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const first = result.array()[0];
  const code = first.msg && String(first.msg).startsWith('INVALID_PHONE')
    ? 'INVALID_PHONE'
    : first.path === 'otp'
      ? 'INVALID_OTP'
      : 'PROFILE_VALIDATION_ERROR';

  const message = code === 'INVALID_PHONE'
    ? 'Enter a valid 10-digit mobile number'
    : first.msg;

  return next(new AppError(message, HTTP_STATUS.BAD_REQUEST, code));
};

module.exports = validationMiddleware;
