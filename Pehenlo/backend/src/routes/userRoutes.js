const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { profileValidation } = require('../middleware/authValidation');

const router = express.Router();

router.get('/me', authMiddleware, userController.getMe);
router.put('/profile', authMiddleware, profileValidation, validationMiddleware, userController.updateProfile);

module.exports = router;
