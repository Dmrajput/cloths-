const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, notificationController.getNotifications);
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
