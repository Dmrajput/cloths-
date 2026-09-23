const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', reviewController.getReviews);
router.post('/', authMiddleware, reviewController.createReview);

module.exports = router;
