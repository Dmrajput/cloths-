const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { optionalAuth } = require('../middleware/authMiddleware');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.post('/', authMiddleware, reviewController.createReview);
router.get('/:reviewId', optionalAuth, reviewController.getReview);
router.put('/:reviewId', authMiddleware, reviewController.updateReview);
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

module.exports = router;
