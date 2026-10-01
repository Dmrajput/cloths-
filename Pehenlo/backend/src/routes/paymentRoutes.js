const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/webhook', paymentController.webhook);
router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/verify', authMiddleware, paymentController.verifyPayment);
router.get('/booking/:bookingId', authMiddleware, paymentController.getBookingPayment);

module.exports = router;
