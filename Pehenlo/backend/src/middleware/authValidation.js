const { body } = require('express-validator');
const { normalizePhone } = require('../utils/phone');

const sendOtpValidation = [
  body('phone')
    .custom((value) => {
      if (!normalizePhone(value)) {
        throw new Error('INVALID_PHONE');
      }
      return true;
    }),
];

const verifyOtpValidation = [
  body('phone')
    .custom((value) => {
      if (!normalizePhone(value)) {
        throw new Error('INVALID_PHONE');
      }
      return true;
    }),
  body('otp')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Enter the 6-digit OTP'),
];

const profileValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('City is required'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address'),
];

module.exports = {
  sendOtpValidation,
  verifyOtpValidation,
  profileValidation,
};
