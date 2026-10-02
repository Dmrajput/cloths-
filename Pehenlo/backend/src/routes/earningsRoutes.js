const express = require('express');
const earningController = require('../controllers/earningController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', authMiddleware, earningController.getSummary);
router.get('/', authMiddleware, earningController.listEarnings);
router.get('/:earningId', authMiddleware, earningController.getEarning);

module.exports = router;
