const { successResponse } = require('../utils/response');
const notificationService = require('../services/notificationService');

const getNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.listForUser(req.user._id, req.query);
    return successResponse(res, data, 'Notifications');
  } catch (error) {
    return next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const data = await notificationService.unreadCount(req.user._id);
    return successResponse(res, data, 'Unread notifications');
  } catch (error) {
    return next(error);
  }
};

const getNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.getOne(req.user._id, req.params.notificationId);
    return successResponse(res, { notification }, 'Notification');
  } catch (error) {
    return next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const data = await notificationService.markRead(req.user._id, req.params.notificationId);
    return successResponse(res, data, 'Notification read');
  } catch (error) {
    return next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAllRead(req.user._id);
    return successResponse(res, data, 'Notifications read');
  } catch (error) {
    return next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const data = await notificationService.remove(req.user._id, req.params.notificationId);
    return successResponse(res, data, 'Notification deleted');
  } catch (error) {
    return next(error);
  }
};

const getPreferences = async (req, res, next) => {
  try {
    const preferences = await notificationService.getPreferences(req.user._id);
    return successResponse(res, { preferences }, 'Notification preferences');
  } catch (error) {
    return next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const preferences = await notificationService.updatePreferences(req.user._id, req.body || {});
    return successResponse(res, { preferences }, 'Preferences updated');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  getNotification,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
};
