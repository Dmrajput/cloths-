const { successResponse } = require('../utils/response');
const earningService = require('../services/earningService');

const getSummary = async (req, res, next) => {
  try {
    const summary = await earningService.summary(req.user);
    return successResponse(res, summary, 'Earnings summary');
  } catch (error) {
    return next(error);
  }
};

const listEarnings = async (req, res, next) => {
  try {
    const result = await earningService.listEarnings(req.user, req.query);
    return successResponse(res, result, 'Earnings');
  } catch (error) {
    return next(error);
  }
};

const getEarning = async (req, res, next) => {
  try {
    const earning = await earningService.getEarning(req.user, req.params.earningId);
    return successResponse(res, { earning }, 'Earning');
  } catch (error) {
    return next(error);
  }
};

module.exports = { getSummary, listEarnings, getEarning };
