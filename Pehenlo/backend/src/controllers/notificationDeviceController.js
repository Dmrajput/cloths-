const { successResponse } = require('../utils/response');
const notificationService = require('../services/notificationService');

const registerDevice = async (req, res, next) => {
  try {
    const device = await notificationService.registerDevice(req.user._id, req.body || {});
    return successResponse(res, { device }, 'Device registered');
  } catch (error) {
    return next(error);
  }
};

const unregisterDevice = async (req, res, next) => {
  try {
    const data = await notificationService.unregisterDevice(req.user._id, req.params.token);
    return successResponse(res, data, 'Device removed');
  } catch (error) {
    return next(error);
  }
};

const listDevices = async (req, res, next) => {
  try {
    const devices = await notificationService.listDevices(req.user._id);
    return successResponse(res, { devices }, 'Devices');
  } catch (error) {
    return next(error);
  }
};

module.exports = { registerDevice, unregisterDevice, listDevices };
