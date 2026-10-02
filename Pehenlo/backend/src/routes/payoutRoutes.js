const express = require('express');
const payoutController = require('../controllers/payoutController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, payoutController.listPayouts);
router.post('/', authMiddleware, payoutController.requestPayout);
router.get('/:payoutId', authMiddleware, payoutController.getPayout);

module.exports = router;
