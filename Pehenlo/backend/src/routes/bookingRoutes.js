const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my/counts', authMiddleware, bookingController.getMyBookingCounts);
router.get('/my', authMiddleware, bookingController.getMyBookings);
router.post('/', authMiddleware, bookingController.createBooking);
router.get('/:id', authMiddleware, bookingController.getBookingById);
router.post('/:id/accept', authMiddleware, bookingController.acceptBooking);
router.post('/:id/reject', authMiddleware, bookingController.rejectBooking);
router.post('/:id/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;
