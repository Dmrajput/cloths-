const logger = require('../utils/logger');

const env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL,
  ADMIN_URL: process.env.ADMIN_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  OTP_PROVIDER_API_KEY: process.env.OTP_PROVIDER_API_KEY,
  OTP_PROVIDER_SENDER_ID: process.env.OTP_PROVIDER_SENDER_ID,
  OTP_MODE: process.env.OTP_MODE || 'development',
  DEV_OTP: process.env.DEV_OTP || '',
  OTP_EXPIRY_MINUTES: Number(process.env.OTP_EXPIRY_MINUTES) || 5,
  OTP_MAX_ATTEMPTS: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
  OTP_REQUEST_LIMIT: Number(process.env.OTP_REQUEST_LIMIT) || 3,
  OTP_REQUEST_WINDOW_MINUTES: Number(process.env.OTP_REQUEST_WINDOW_MINUTES) || 15,
  OTP_IP_REQUEST_LIMIT: Number(process.env.OTP_IP_REQUEST_LIMIT) || 10,
};

const WEAK_SECRETS = new Set(['', 'change_me_jwt_secret', 'secret', 'jwt_secret']);

function assertSecureConfig() {
  const isProduction = env.NODE_ENV === 'production';

  if (!env.JWT_SECRET) {
    logger.error('JWT_SECRET is required');
    process.exit(1);
  }

  if (isProduction && env.OTP_MODE === 'development') {
    logger.error('OTP_MODE=development is not allowed when NODE_ENV=production');
    process.exit(1);
  }

  if (isProduction && (WEAK_SECRETS.has(env.JWT_SECRET) || env.JWT_SECRET.length < 32)) {
    logger.error('JWT_SECRET must be a strong unique secret in production');
    process.exit(1);
  }

  if (isProduction && !env.MONGODB_URI) {
    logger.error('MONGODB_URI is required in production');
    process.exit(1);
  }

  if (!isProduction && env.OTP_MODE === 'development' && !/^\d{6}$/.test(env.DEV_OTP)) {
    logger.error('DEV_OTP must be a 6-digit code when OTP_MODE=development');
    process.exit(1);
  }

  if (!isProduction && WEAK_SECRETS.has(env.JWT_SECRET)) {
    logger.warn('JWT_SECRET is a placeholder. Use a strong secret before any shared environment.');
  }
}

module.exports = env;
module.exports.assertSecureConfig = assertSecureConfig;
