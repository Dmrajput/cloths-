const env = require('../config/env');
const logger = require('../utils/logger');
const DeviceToken = require('../models/DeviceToken');

const PUSH_URL = env.EXPO_PUSH_API_URL || 'https://exp.host/--/api/v2/push/send';

function messageFor(token, notification) {
  return {
    to: token.token,
    title: notification.title,
    body: notification.message,
    sound: 'default',
    priority: notification.priority === 'HIGH' ? 'high' : 'default',
    channelId: String(notification.category || 'default').toLowerCase(),
    data: {
      notificationId: String(notification._id),
      action: notification.data?.action || '',
      bookingId: notification.data?.bookingId ? String(notification.data.bookingId) : '',
      listingId: notification.data?.listingId ? String(notification.data.listingId) : '',
      reviewId: notification.data?.reviewId ? String(notification.data.reviewId) : '',
      earningId: notification.data?.earningId ? String(notification.data.earningId) : '',
      payoutId: notification.data?.payoutId ? String(notification.data.payoutId) : '',
      userId: notification.data?.userId ? String(notification.data.userId) : '',
    },
  };
}

async function deactivateInvalidToken(token) {
  await DeviceToken.updateOne({ token }, { $set: { isActive: false } });
}

async function sendBatch(messages) {
  const response = await fetch(PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error('Push provider unavailable');
    error.transient = response.status >= 500;
    throw error;
  }
  return payload.data || [];
}

async function sendToDevices(devices, notification) {
  const active = (devices || []).filter((device) => device.isActive && device.token);
  if (!active.length) return { sent: false, failed: false };
  const messages = active.map((device) => messageFor(device, notification));
  let tickets;
  try {
    tickets = await sendBatch(messages);
  } catch (error) {
    if (error.transient) {
      try {
        tickets = await sendBatch(messages);
      } catch (retryError) {
        logger.warn('push_failed', { notificationId: String(notification._id) });
        return { sent: false, failed: true };
      }
    } else {
      logger.warn('push_failed', { notificationId: String(notification._id) });
      return { sent: false, failed: true };
    }
  }
  let sent = false;
  await Promise.all(tickets.map(async (ticket, index) => {
    if (ticket?.status === 'ok') {
      sent = true;
      return;
    }
    const code = ticket?.details?.error || ticket?.message || '';
    if (code === 'DeviceNotRegistered' || /not a valid Expo push token/i.test(String(code))) {
      await deactivateInvalidToken(active[index].token);
    }
  }));
  return { sent, failed: !sent };
}

async function sendToUser(userId, notification) {
  const devices = await DeviceToken.find({ user: userId, isActive: true }).select('token isActive').lean();
  return sendToDevices(devices, notification);
}

module.exports = {
  sendToUser,
  sendToDevices,
  deactivateInvalidToken,
};
