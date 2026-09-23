const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, paymentController.createPayment);
router.post('/verify', authMiddleware, paymentController.verifyPayment);
router.get('/history', authMiddleware, paymentController.getPaymentHistory);

module.exports = router;
