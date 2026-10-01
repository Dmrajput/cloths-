const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    /**
     * Document lifetime for rate-limit history.
     * OTP validity itself is enforced with expiresAt.
     * A TTL on expiresAt would delete the record before the request window ends.
     */
    ttlAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['login'],
      default: 'login',
    },
    consumed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

otpSchema.index({ phone: 1, createdAt: -1 });
otpSchema.index({ ttlAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
