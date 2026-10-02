const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const DeviceToken = require('../models/DeviceToken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../utils/constants');
const {
  TYPES,
  CATEGORIES,
  PREFERENCE_KEYS,
  CATEGORY_PREFERENCE,
} = require('../constants/notificationConstants');
const { getTemplate } = require('./notificationTemplates');
const { serializeNotification } = require('../utils/notificationSerializer');
const { sendToUser } = require('./pushNotificationService');

const RETENTION_MS = 180 * 24 * 60 * 60 * 1000;
const attempts = new Map();
let lastCleanup = 0;

function assertRate(userId, action, limit) {
  const now = Date.now();
  const key = `${action}:${userId}`;
  const recent = (attempts.get(key) || []).filter((stamp) => now - stamp < 15 * 60 * 1000);
  if (recent.length >= limit) {
    throw new AppError('Please wait a moment and try again', HTTP_STATUS.TOO_MANY_REQUESTS, 'RATE_LIMITED');
  }
  recent.push(now);
  attempts.set(key, recent);
}

function defaultPreferences() {
  return {
    pushEnabled: true,
    booking: true,
    payment: true,
    earnings: true,
    reviews: true,
    listings: true,
    safety: true,
    account: true,
  };
}

async function cleanupOldNotifications() {
  const now = Date.now();
  if (now - lastCleanup < 24 * 60 * 60 * 1000) return;
  lastCleanup = now;
  const cutoff = new Date(now - RETENTION_MS);
  await Notification.deleteMany({ createdAt: { $lt: cutoff } });
}

async function createNotificationIfNotExists(input) {
  const template = getTemplate(input.type);
  if (!TYPES.includes(input.type) || !template) {
    throw new AppError('Notification type is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_NOTIFICATION');
  }
  if (!input.recipient || !input.idempotencyKey) return null;
  const existing = await Notification.findOne({ idempotencyKey: input.idempotencyKey });
  if (existing) return existing;
  try {
    return await Notification.create({
      recipient: input.recipient,
      actor: input.actor || null,
      type: input.type,
      category: template.category,
      priority: template.priority,
      title: template.title,
      message: template.message,
      data: { ...(input.data || {}), action: template.action },
      entityType: input.entityType || null,
      entityId: input.entityId || null,
      idempotencyKey: input.idempotencyKey,
      status: 'PENDING',
    });
  } catch (error) {
    if (error?.code === 11000) return Notification.findOne({ idempotencyKey: input.idempotencyKey });
    throw error;
  }
}

async function deliverPush(notification) {
  const user = await User.findById(notification.recipient).select('notificationPreferences');
  const preferences = { ...defaultPreferences(), ...(user?.notificationPreferences || {}) };
  const preferenceKey = CATEGORY_PREFERENCE[notification.category];
  const pushAllowed = preferences.pushEnabled !== false && preferences[preferenceKey] !== false;
  if (!pushAllowed) return notification;
  const result = await sendToUser(notification.recipient, notification);
  if (result.sent) {
    notification.isSentPush = true;
    notification.pushSentAt = new Date();
    notification.status = 'SENT';
  } else if (result.failed) {
    notification.status = 'FAILED';
  }
  await notification.save();
  return notification;
}

async function notifyUser(input) {
  try {
    const notification = await createNotificationIfNotExists(input);
    if (!notification || notification.isSentPush || notification.status === 'SENT') return notification;
    if (notification.isRead) return notification;
    return await deliverPush(notification);
  } catch (error) {
    logger.warn('notification_failed', { type: input?.type || 'unknown' });
    return null;
  }
}

async function listForUser(userId, query) {
  await cleanupOldNotifications().catch(() => {});
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const filter = { recipient: userId };
  if (query.category) {
    if (!CATEGORIES.includes(query.category)) {
      throw new AppError('Category is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_NOTIFICATION');
    }
    filter.category = query.category;
  }
  const [total, rows] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  return {
    items: rows.map(serializeNotification),
    pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages && total > 0 },
  };
}

async function unreadCount(userId) {
  const count = await Notification.countDocuments({ recipient: userId, isRead: false });
  return { unreadCount: count };
}

async function getOne(userId, notificationId) {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
  }
  const notification = await Notification.findOne({ _id: notificationId, recipient: userId }).lean();
  if (!notification) throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
  return serializeNotification(notification);
}

async function markRead(userId, notificationId) {
  assertRate(userId, 'read', 80);
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
  }
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { isRead: true, readAt: new Date(), status: 'READ' } },
    { new: true }
  ).lean();
  if (!notification) throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
  const count = await unreadCount(userId);
  return { notification: serializeNotification(notification), ...count };
}

async function markAllRead(userId) {
  assertRate(userId, 'read-all', 20);
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date(), status: 'READ' } }
  );
  return unreadCount(userId);
}

async function remove(userId, notificationId) {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
  }
  const removed = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  if (!removed) throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
  return unreadCount(userId);
}

async function getPreferences(userId) {
  const user = await User.findById(userId).select('notificationPreferences');
  return { ...defaultPreferences(), ...(user?.notificationPreferences?.toObject?.() || user?.notificationPreferences || {}) };
}

async function updatePreferences(userId, body) {
  assertRate(userId, 'preferences', 20);
  const current = await getPreferences(userId);
  const next = { ...current };
  PREFERENCE_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(body || {}, key)) {
      if (typeof body[key] !== 'boolean') {
        throw new AppError('Preference value is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_NOTIFICATION');
      }
      next[key] = body[key];
    }
  });
  const unknown = Object.keys(body || {}).filter((key) => !PREFERENCE_KEYS.includes(key));
  if (unknown.length) {
    throw new AppError('Preference is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_NOTIFICATION');
  }
  await User.updateOne({ _id: userId }, { $set: { notificationPreferences: next } });
  return next;
}

function validToken(token) {
  return typeof token === 'string' && token.length >= 20 && token.length <= 255 && /^[A-Za-z0-9_\-\[\]:]+$/.test(token);
}

async function registerDevice(userId, body) {
  assertRate(userId, 'device', 15);
  const token = String(body?.token || '').trim();
  const platform = body?.platform;
  if (!validToken(token) || !['ANDROID', 'IOS'].includes(platform)) {
    throw new AppError('Device token is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_DEVICE_TOKEN');
  }
  const device = await DeviceToken.findOneAndUpdate(
    { token },
    {
      $set: {
        user: userId,
        platform,
        deviceId: String(body?.deviceId || '').slice(0, 120),
        appVersion: String(body?.appVersion || '').slice(0, 40),
        isActive: true,
        lastUsedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );
  return {
    id: String(device._id),
    platform: device.platform,
    isActive: device.isActive,
  };
}

async function unregisterDevice(userId, token) {
  const value = decodeURIComponent(String(token || '')).trim();
  if (!validToken(value)) throw new AppError('Device token is invalid', HTTP_STATUS.BAD_REQUEST, 'INVALID_DEVICE_TOKEN');
  await DeviceToken.updateOne({ token: value, user: userId }, { $set: { isActive: false } });
  return { active: false };
}

async function listDevices(userId) {
  const rows = await DeviceToken.find({ user: userId }).sort({ lastUsedAt: -1 }).lean();
  return rows.map((row) => ({
    id: String(row._id),
    platform: row.platform,
    isActive: row.isActive,
    lastUsedAt: row.lastUsedAt,
    tokenHint: row.token.slice(-6),
  }));
}

function bookingData(booking) {
  return { bookingId: booking._id, listingId: booking.listing };
}

async function notifyBookingRequested(booking) {
  return notifyUser({
    recipient: booking.owner,
    actor: booking.renter,
    type: 'BOOKING_REQUEST_RECEIVED',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:request_received`,
  });
}

async function notifyBookingAccepted(booking) {
  await notifyUser({
    recipient: booking.renter,
    actor: booking.owner,
    type: 'BOOKING_REQUEST_ACCEPTED',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:accepted`,
  });
  return notifyUser({
    recipient: booking.renter,
    actor: booking.owner,
    type: 'PAYMENT_REQUIRED',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:payment_required`,
  });
}

async function notifyBookingRejected(booking) {
  return notifyUser({
    recipient: booking.renter,
    actor: booking.owner,
    type: 'BOOKING_REQUEST_REJECTED',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:rejected`,
  });
}

async function notifyBookingCancelled(booking) {
  return notifyUser({
    recipient: booking.owner,
    actor: booking.renter,
    type: 'BOOKING_CANCELLED',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:cancelled`,
  });
}

async function notifyBookingExpired(booking, { paymentWindow = false } = {}) {
  if (paymentWindow) {
    return notifyUser({
      recipient: booking.renter,
      type: 'PAYMENT_EXPIRED',
      entityType: 'BOOKING',
      entityId: booking._id,
      data: bookingData(booking),
      idempotencyKey: `booking:${booking._id}:payment_expired`,
    });
  }
  await notifyUser({
    recipient: booking.renter,
    type: 'BOOKING_EXPIRED',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:expired:renter`,
  });
  return notifyUser({
    recipient: booking.owner,
    type: 'BOOKING_EXPIRED',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:expired:owner`,
  });
}

async function notifyPaymentCompleted(booking) {
  await notifyUser({
    recipient: booking.renter,
    type: 'PAYMENT_SUCCESS',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:payment_success:renter`,
  });
  await notifyUser({
    recipient: booking.owner,
    type: 'BOOKING_PAYMENT_COMPLETED',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:payment_success:owner`,
  });
  return notifyUser({
    recipient: booking.renter,
    actor: booking.owner,
    type: 'BOOKING_CONFIRMED',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:confirmed:renter`,
  }).then(() => notifyUser({
    recipient: booking.owner,
    type: 'BOOKING_CONFIRMED',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:confirmed:owner`,
  }));
}

async function notifyPaymentFailed(booking) {
  if (!booking) return null;
  return notifyUser({
    recipient: booking.renter,
    type: 'PAYMENT_FAILED',
    entityType: 'BOOKING',
    entityId: booking._id,
    data: bookingData(booking),
    idempotencyKey: `booking:${booking._id}:payment_failed`,
  });
}

async function notifyEarningCreated(earning) {
  return notifyUser({
    recipient: earning.seller,
    type: 'EARNING_CREATED',
    entityType: 'EARNING',
    entityId: earning._id,
    data: { earningId: earning._id, bookingId: earning.booking, listingId: earning.listing },
    idempotencyKey: `earning:${earning._id}:created`,
  });
}

async function notifyEarningAvailable(earning) {
  return notifyUser({
    recipient: earning.seller,
    type: 'EARNING_AVAILABLE',
    entityType: 'EARNING',
    entityId: earning._id,
    data: { earningId: earning._id, bookingId: earning.booking },
    idempotencyKey: `earning:${earning._id}:available`,
  });
}

async function notifyPayoutRequested(payout) {
  return notifyUser({
    recipient: payout.seller,
    type: 'PAYOUT_REQUESTED',
    entityType: 'PAYOUT',
    entityId: payout._id,
    data: { payoutId: payout._id },
    idempotencyKey: `payout:${payout._id}:requested`,
  });
}

async function notifyPayoutPaid(payout) {
  return notifyUser({
    recipient: payout.seller,
    type: 'PAYOUT_PAID',
    entityType: 'PAYOUT',
    entityId: payout._id,
    data: { payoutId: payout._id },
    idempotencyKey: `payout:${payout._id}:paid`,
  });
}

async function notifyPayoutFailed(payout) {
  return notifyUser({
    recipient: payout.seller,
    type: 'PAYOUT_FAILED',
    entityType: 'PAYOUT',
    entityId: payout._id,
    data: { payoutId: payout._id },
    idempotencyKey: `payout:${payout._id}:failed`,
  });
}

async function notifyReviewReceived(review) {
  if (review.status !== 'PUBLISHED') return null;
  return notifyUser({
    recipient: review.reviewee,
    actor: review.reviewer,
    type: 'REVIEW_RECEIVED',
    entityType: 'REVIEW',
    entityId: review._id,
    data: { reviewId: review._id, listingId: review.listing, bookingId: review.booking },
    idempotencyKey: `review:${review._id}:received`,
  });
}

async function notifyListingSubmitted(listing, ownerId) {
  return notifyUser({
    recipient: ownerId,
    type: 'LISTING_SUBMITTED',
    entityType: 'LISTING',
    entityId: listing._id,
    data: { listingId: listing._id },
    idempotencyKey: `listing:${listing._id}:submitted`,
  });
}

async function notifyReportReceived(report) {
  return notifyUser({
    recipient: report.reporter,
    type: 'REPORT_RECEIVED',
    entityType: 'REPORT',
    entityId: report._id,
    data: { reportId: report._id },
    idempotencyKey: `report:${report._id}:received`,
  });
}

async function notifyWelcome(userId) {
  return notifyUser({
    recipient: userId,
    type: 'WELCOME',
    entityType: 'USER',
    entityId: userId,
    data: { userId },
    idempotencyKey: `user:${userId}:welcome`,
  });
}

async function notifyProfileUpdated(userId) {
  return notifyUser({
    recipient: userId,
    type: 'PROFILE_UPDATED',
    entityType: 'USER',
    entityId: userId,
    data: { userId },
    idempotencyKey: `user:${userId}:profile:${new Date().toISOString().slice(0, 13)}`,
  });
}

module.exports = {
  notifyUser,
  listForUser,
  unreadCount,
  getOne,
  markRead,
  markAllRead,
  remove,
  getPreferences,
  updatePreferences,
  registerDevice,
  unregisterDevice,
  listDevices,
  cleanupOldNotifications,
  notifyBookingRequested,
  notifyBookingAccepted,
  notifyBookingRejected,
  notifyBookingCancelled,
  notifyBookingExpired,
  notifyPaymentCompleted,
  notifyPaymentFailed,
  notifyEarningCreated,
  notifyEarningAvailable,
  notifyPayoutRequested,
  notifyPayoutPaid,
  notifyPayoutFailed,
  notifyReviewReceived,
  notifyListingSubmitted,
  notifyReportReceived,
  notifyWelcome,
  notifyProfileUpdated,
};
