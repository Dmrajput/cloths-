const mongoose = require('mongoose');
const { TYPES, CATEGORIES, PRIORITIES, STATUSES } = require('../constants/notificationConstants');

const dataSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, default: null },
    listingId: { type: mongoose.Schema.Types.ObjectId, default: null },
    reviewId: { type: mongoose.Schema.Types.ObjectId, default: null },
    earningId: { type: mongoose.Schema.Types.ObjectId, default: null },
    payoutId: { type: mongoose.Schema.Types.ObjectId, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
    reportId: { type: mongoose.Schema.Types.ObjectId, default: null },
    action: { type: String, default: null },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, enum: TYPES, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    priority: { type: String, enum: PRIORITIES, default: 'NORMAL' },
    title: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 300 },
    data: { type: dataSchema, default: () => ({}) },
    entityType: { type: String, default: null },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    isSentPush: { type: Boolean, default: false },
    pushSentAt: { type: Date, default: null },
    status: { type: String, enum: STATUSES, default: 'PENDING' },
    idempotencyKey: { type: String, required: true },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ idempotencyKey: 1 }, { unique: true });
notificationSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
