const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');
const notificationDeviceController = require('../controllers/notificationDeviceController');

const router = express.Router();

router.use(authMiddleware);

router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreferences);
router.get('/devices', notificationDeviceController.listDevices);
router.post('/devices', notificationDeviceController.registerDevice);
router.delete('/devices/:token', notificationDeviceController.unregisterDevice);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllRead);
router.get('/', notificationController.getNotifications);
router.get('/:notificationId', notificationController.getNotification);
router.patch('/:notificationId/read', notificationController.markNotificationRead);
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
