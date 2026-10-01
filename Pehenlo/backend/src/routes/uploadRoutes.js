const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const listingController = require('../controllers/listingController');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new AppError('Use a JPG, PNG, or WebP photo', HTTP_STATUS.BAD_REQUEST, 'INVALID_IMAGE'));
  },
});

router.post(
  '/listing-image',
  authMiddleware,
  upload.single('image'),
  listingController.uploadListingImage
);

module.exports = router;
