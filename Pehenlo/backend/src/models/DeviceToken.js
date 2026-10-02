const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, maxlength: 255 },
    platform: { type: String, enum: ['ANDROID', 'IOS'], required: true },
    deviceId: { type: String, default: '', maxlength: 120 },
    appVersion: { type: String, default: '', maxlength: 40 },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

deviceTokenSchema.index({ token: 1 }, { unique: true });
deviceTokenSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
