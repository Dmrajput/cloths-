const express = require('express');
const listingController = require('../controllers/listingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listingController.getListings);
router.post('/', authMiddleware, listingController.createListing);
router.get('/:id', listingController.getListingById);
router.put('/:id', authMiddleware, listingController.updateListing);

module.exports = router;
