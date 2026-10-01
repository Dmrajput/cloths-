const { successResponse } = require('../utils/response');
const { toPublicUser } = require('../utils/userPresenter');

const getMe = async (req, res, next) => {
  try {
    return successResponse(res, { user: toPublicUser(req.user) }, 'Profile');
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim().replace(/\s+/g, ' ');
    const city = String(req.body.city || '').trim().replace(/\s+/g, ' ');
    const email = String(req.body.email || '').trim().toLowerCase();

    req.user.name = name;
    req.user.city = city;
    req.user.email = email;
    req.user.isProfileCompleted = Boolean(name && city);
    await req.user.save();

    return successResponse(res, { user: toPublicUser(req.user) }, 'Profile updated');
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMe, updateProfile };
