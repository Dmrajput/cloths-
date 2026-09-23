const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, bookingController.getBookings);
router.post('/', authMiddleware, bookingController.createBooking);
router.get('/:id', authMiddleware, bookingController.getBookingById);
router.post('/:id/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;
