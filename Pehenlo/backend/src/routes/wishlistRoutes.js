const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const wishlistController = require('../controllers/wishlistController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', wishlistController.getWishlist);
router.get('/ids', wishlistController.getWishlistIds);
router.get('/count', wishlistController.getWishlistCount);
router.get('/check/:listingId', wishlistController.checkWishlist);
router.post('/:listingId', wishlistController.addToWishlist);
router.delete('/:listingId', wishlistController.removeFromWishlist);

module.exports = router;
