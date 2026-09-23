const express = require('express');
const earningsController = require('../controllers/earningsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, earningsController.getEarnings);
router.post('/payout', authMiddleware, earningsController.requestPayout);
router.get('/payouts', authMiddleware, earningsController.getPayoutHistory);

module.exports = router;
