const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { optionalAuth } = require('../middleware/authMiddleware');
const listingController = require('../controllers/listingController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/my/drafts', authMiddleware, listingController.getMyDrafts);
router.get('/my/:id', authMiddleware, listingController.getMyListing);
router.get('/my', authMiddleware, listingController.getMyListings);
router.post('/', authMiddleware, listingController.createListing);
router.put('/:id', authMiddleware, listingController.updateListing);
router.post('/:id/submit', authMiddleware, listingController.submitListing);
router.delete('/:id/images/:imageId', authMiddleware, listingController.deleteListingImage);
router.delete('/:id', authMiddleware, listingController.deleteListing);
router.get('/', listingController.getListings);
router.get('/featured', listingController.getFeaturedListings);
router.get('/trending', listingController.getTrendingListings);
router.get('/nearby', listingController.getNearbyListings);
router.get('/recent', listingController.getRecentListings);
router.get('/:id/availability/calendar', bookingController.getAvailabilityCalendar);
router.get('/:id/availability', optionalAuth, bookingController.getAvailability);
router.post('/:id/booking-price', bookingController.previewBookingPrice);
router.get('/:id/similar', listingController.getSimilarListings);
router.post('/:id/view', optionalAuth, listingController.trackListingView);
router.get('/:id', optionalAuth, listingController.getListingById);

module.exports = router;
