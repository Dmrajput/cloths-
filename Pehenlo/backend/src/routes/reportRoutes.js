const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.use(authMiddleware);
router.get('/my', reportController.getMyReports);
router.post('/', reportController.createReport);

module.exports = router;
