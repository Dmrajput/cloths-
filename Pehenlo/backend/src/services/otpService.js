const crypto = require('crypto');
const env = require('../config/env');
const Otp = require('../models/Otp');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { maskPhone } = require('../utils/phone');
const { HTTP_STATUS, OTP_PURPOSE } = require('../utils/constants');

const ipRequests = new Map();

function hashOtp(phone, otp) {
  return crypto.createHmac('sha256', env.JWT_SECRET).update(`${phone}:${otp}`).digest('hex');
}

function hashesMatch(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function createOtpCode() {
  const isDevelopmentOtp = env.NODE_ENV !== 'production' && env.OTP_MODE === 'development';
  if (isDevelopmentOtp) {
    return env.DEV_OTP;
  }
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

function pruneIpWindow(now, windowMs) {
  for (const [ip, timestamps] of ipRequests.entries()) {
    const recent = timestamps.filter((time) => now - time < windowMs);
    if (recent.length === 0) {
      ipRequests.delete(ip);
    } else {
      ipRequests.set(ip, recent);
    }
  }
}

function assertIpRateLimit(ip) {
  const now = Date.now();
  const windowMs = env.OTP_REQUEST_WINDOW_MINUTES * 60 * 1000;
  pruneIpWindow(now, windowMs);

  const recent = ipRequests.get(ip) || [];
  if (recent.length >= env.OTP_IP_REQUEST_LIMIT) {
    throw new AppError(
      'Too many OTP requests. Please wait and try again.',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      'OTP_RATE_LIMITED'
    );
  }

  recent.push(now);
  ipRequests.set(ip, recent);
}

async function assertPhoneRateLimit(phone) {
  const windowStart = new Date(Date.now() - env.OTP_REQUEST_WINDOW_MINUTES * 60 * 1000);
  const count = await Otp.countDocuments({
    phone,
    purpose: OTP_PURPOSE.LOGIN,
    createdAt: { $gte: windowStart },
  });

  if (count >= env.OTP_REQUEST_LIMIT) {
    throw new AppError(
      'Too many OTP requests for this number. Please wait and try again.',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      'OTP_RATE_LIMITED'
    );
  }
}

/**
 * Development mode does not call an SMS provider and does not return the OTP.
 * The local code is the DEV_OTP environment value.
 * Any other mode currently fails closed until a provider is configured.
 */
async function deliverOtp(phone) {
  const isDevelopmentOtp = env.NODE_ENV !== 'production' && env.OTP_MODE === 'development';

  if (isDevelopmentOtp) {
    logger.info(`OTP requested for phone ending ${maskPhone(phone)} (development mode)`);
    return;
  }

  logger.warn(`OTP delivery is not configured for phone ending ${maskPhone(phone)}`);
  throw new AppError(
    'Unable to send OTP right now. Please try again later.',
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    'OTP_SEND_FAILED'
  );
}

async function sendLoginOtp({ phone, ip }) {
  assertIpRateLimit(ip);
  await assertPhoneRateLimit(phone);

  const code = createOtpCode();
  await deliverOtp(phone);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.OTP_EXPIRY_MINUTES * 60 * 1000);
  const ttlAt = new Date(now.getTime() + env.OTP_REQUEST_WINDOW_MINUTES * 60 * 1000);

  await Otp.create({
    phone,
    otpHash: hashOtp(phone, code),
    expiresAt,
    ttlAt,
    attempts: 0,
    lastSentAt: now,
    purpose: OTP_PURPOSE.LOGIN,
    consumed: false,
  });

  return {
    expiresInSeconds: env.OTP_EXPIRY_MINUTES * 60,
    resendAvailableInSeconds: 30,
  };
}

async function verifyLoginOtp({ phone, otp }) {
  const record = await Otp.findOne({
    phone,
    purpose: OTP_PURPOSE.LOGIN,
    consumed: false,
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new AppError('Invalid OTP', HTTP_STATUS.BAD_REQUEST, 'INVALID_OTP');
  }

  if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
    throw new AppError(
      'Too many incorrect attempts. Request a new OTP.',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      'OTP_ATTEMPTS_EXCEEDED'
    );
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    throw new AppError('OTP has expired. Request a new one.', HTTP_STATUS.BAD_REQUEST, 'OTP_EXPIRED');
  }

  const suppliedHash = hashOtp(phone, String(otp || '').trim());
  if (!hashesMatch(record.otpHash, suppliedHash)) {
    record.attempts += 1;
    await record.save();

    if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
      throw new AppError(
        'Too many incorrect attempts. Request a new OTP.',
        HTTP_STATUS.TOO_MANY_REQUESTS,
        'OTP_ATTEMPTS_EXCEEDED'
      );
    }

    throw new AppError('Invalid OTP', HTTP_STATUS.BAD_REQUEST, 'INVALID_OTP');
  }

  record.consumed = true;
  await record.save();
  return true;
}

module.exports = {
  sendLoginOtp,
  verifyLoginOtp,
};
