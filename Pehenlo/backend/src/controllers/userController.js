const multer = require('multer');
const { successResponse } = require('../utils/response');
const { toPublicUser } = require('../utils/userPresenter');
const userService = require('../services/userService');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');

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

const getMe = async (req, res, next) => {
  try {
    return successResponse(res, { user: toPublicUser(req.user) }, 'Profile');
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    await userService.applyProfile(req.user, {
      name: req.body.name,
      city: req.body.city,
      email: req.body.email,
    });
    return successResponse(res, { user: toPublicUser(req.user) }, 'Profile updated');
  } catch (error) {
    return next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    await userService.applyProfile(req.user, req.body || {});
    return successResponse(res, { user: toPublicUser(req.user) }, 'Profile updated');
  } catch (error) {
    return next(error);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const data = await userService.summary(req.user._id);
    return successResponse(res, data, 'Profile summary');
  } catch (error) {
    return next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    const data = await userService.setProfileImage(req.user, req.file, req);
    return successResponse(res, { ...data, user: toPublicUser(req.user) }, 'Profile photo updated');
  } catch (error) {
    return next(error);
  }
};

const removeProfileImage = async (req, res, next) => {
  try {
    const data = await userService.clearProfileImage(req.user);
    return successResponse(res, { ...data, user: toPublicUser(req.user) }, 'Profile photo removed');
  } catch (error) {
    return next(error);
  }
};

const requestAccountDeletion = async (req, res, next) => {
  try {
    const data = await userService.requestDeletion(req.user);
    return successResponse(res, data, data.message);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  upload,
  getMe,
  updateProfile,
  updateMe,
  getSummary,
  uploadProfileImage,
  removeProfileImage,
  requestAccountDeletion,
};
