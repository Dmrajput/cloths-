const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const userSafetyController = require('../controllers/userSafetyController');
const reviewController = require('../controllers/reviewController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { profileValidation } = require('../middleware/authValidation');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, userController.getMe);
router.get('/me/summary', authMiddleware, userController.getSummary);
router.put('/me', authMiddleware, userController.updateMe);
router.put('/profile', authMiddleware, profileValidation, validationMiddleware, userController.updateProfile);
router.post(
  '/me/profile-image',
  authMiddleware,
  (req, res, next) => {
    userController.upload.single('image')(req, res, (error) => {
      if (error) {
        const tooLarge = error.code === 'LIMIT_FILE_SIZE';
        return next(tooLarge
          ? Object.assign(error, { statusCode: 400, code: 'INVALID_IMAGE', message: 'Photo must be 5 MB or smaller' })
          : error);
      }
      return next();
    });
  },
  userController.uploadProfileImage
);
router.delete('/me/profile-image', authMiddleware, userController.removeProfileImage);
router.post('/me/delete-request', authMiddleware, userController.requestAccountDeletion);
router.get('/blocked', authMiddleware, userSafetyController.getBlockedUsers);
router.get('/:userId/public', optionalAuth, userSafetyController.getPublicProfile);
router.get('/:userId/reviews', reviewController.getUserReviews);
router.post('/:userId/block', authMiddleware, userSafetyController.blockUser);
router.delete('/:userId/block', authMiddleware, userSafetyController.unblockUser);

module.exports = router;
