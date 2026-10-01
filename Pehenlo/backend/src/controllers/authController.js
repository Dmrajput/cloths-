const User = require('../models/User');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const { toPublicUser } = require('../utils/userPresenter');
const { normalizePhone } = require('../utils/phone');
const generateToken = require('../utils/generateToken');
const { sendLoginOtp, verifyLoginOtp } = require('../services/otpService');
const { HTTP_STATUS } = require('../utils/constants');

const clientIp = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

const sendOtp = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone) {
      throw new AppError('Enter a valid 10-digit mobile number', HTTP_STATUS.BAD_REQUEST, 'INVALID_PHONE');
    }

    const data = await sendLoginOtp({ phone, ip: clientIp(req) });
    return successResponse(res, data, 'OTP sent');
  } catch (error) {
    return next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone) {
      throw new AppError('Enter a valid 10-digit mobile number', HTTP_STATUS.BAD_REQUEST, 'INVALID_PHONE');
    }

    await verifyLoginOtp({ phone, otp: req.body.otp });

    let user = await User.findOne({ phone });
    if (user && !user.isActive) {
      throw new AppError('This account is not active', HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
    }

    if (!user) {
      user = await User.create({
        phone,
        isPhoneVerified: true,
        isProfileCompleted: false,
        country: 'India',
        role: 'user',
        lastLoginAt: new Date(),
      });
    } else {
      user.isPhoneVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const token = generateToken({ sub: String(user._id) });

    return successResponse(
      res,
      {
        user: toPublicUser(user),
        token,
      },
      'Authentication successful'
    );
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    return successResponse(res, { user: toPublicUser(req.user) }, 'Authenticated user');
  } catch (error) {
    return next(error);
  }
};

/**
 * Stateless JWT logout.
 * The token is not revoked server-side. The client must delete it from secure storage.
 */
const logout = async (_req, res, next) => {
  try {
    return successResponse(res, null, 'Logged out');
  } catch (error) {
    return next(error);
  }
};

module.exports = { sendOtp, verifyOtp, me, logout };
