const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
      maxlength: 60,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      enum: ['', 'female', 'male', 'other', 'prefer_not_to_say'],
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    city: {
      type: String,
      trim: true,
      default: '',
      maxlength: 80,
    },
    state: {
      type: String,
      trim: true,
      default: '',
      maxlength: 80,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: 250,
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    notificationPreferences: {
      pushEnabled: { type: Boolean, default: true },
      booking: { type: Boolean, default: true },
      payment: { type: Boolean, default: true },
      earnings: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true },
      listings: { type: Boolean, default: true },
      safety: { type: Boolean, default: true },
      account: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
