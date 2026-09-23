const express = require('express');
const disputeController = require('../controllers/disputeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, disputeController.getDisputes);
router.post('/', authMiddleware, disputeController.createDispute);
router.get('/:id', authMiddleware, disputeController.getDisputeById);

module.exports = router;
