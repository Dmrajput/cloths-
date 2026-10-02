const { ACTIONS, DATA_KEYS } = require('../constants/notificationConstants');

function sanitizeNotificationData(data) {
  const source = data || {};
  const safe = {};
  DATA_KEYS.forEach((key) => {
    if (source[key] == null || source[key] === '') return;
    if (key === 'action') {
      if (ACTIONS.includes(source.action)) safe.action = source.action;
      return;
    }
    safe[key] = String(source[key]);
  });
  return safe;
}

function serializeNotification(notification) {
  if (!notification) return null;
  return {
    id: String(notification._id),
    type: notification.type,
    category: notification.category,
    priority: notification.priority,
    title: notification.title,
    message: notification.message,
    data: sanitizeNotificationData(notification.data),
    isRead: Boolean(notification.isRead),
    createdAt: notification.createdAt,
  };
}

module.exports = { sanitizeNotificationData, serializeNotification };
