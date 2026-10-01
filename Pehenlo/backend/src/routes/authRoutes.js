const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { sendOtpValidation, verifyOtpValidation } = require('../middleware/authValidation');

const router = express.Router();

router.post('/send-otp', sendOtpValidation, validationMiddleware, authController.sendOtp);
router.post('/verify-otp', verifyOtpValidation, validationMiddleware, authController.verifyOtp);
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
