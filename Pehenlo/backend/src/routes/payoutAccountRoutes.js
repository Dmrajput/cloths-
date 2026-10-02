const express = require('express');
const payoutController = require('../controllers/payoutController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, payoutController.getAccount);
router.post('/', authMiddleware, payoutController.createAccount);
router.put('/:id', authMiddleware, payoutController.updateAccount);

module.exports = router;
