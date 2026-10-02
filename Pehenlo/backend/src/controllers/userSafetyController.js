const { successResponse } = require('../utils/response');
const userSafetyService = require('../services/userSafetyService');

const blockUser = async (req, res, next) => {
  try {
    const data = await userSafetyService.blockUser(req.user._id, req.params.userId);
    return successResponse(res, data, 'User blocked');
  } catch (error) {
    return next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const data = await userSafetyService.unblockUser(req.user._id, req.params.userId);
    return successResponse(res, data, 'User unblocked');
  } catch (error) {
    return next(error);
  }
};

const getBlockedUsers = async (req, res, next) => {
  try {
    const users = await userSafetyService.listBlocked(req.user._id);
    return successResponse(res, { users }, 'Blocked users');
  } catch (error) {
    return next(error);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const profile = await userSafetyService.publicProfile(req.params.userId, req.user?._id);
    return successResponse(res, { profile }, 'Profile');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  blockUser,
  unblockUser,
  getBlockedUsers,
  getPublicProfile,
};
