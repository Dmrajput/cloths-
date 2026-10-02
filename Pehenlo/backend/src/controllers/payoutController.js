const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');
const payoutService = require('../services/payoutService');

const getAccount = async (req, res, next) => {
  try {
    const account = await payoutService.getAccount(req.user);
    return successResponse(res, { account }, 'Payout account');
  } catch (error) {
    return next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const account = await payoutService.saveAccount(req.user, req.body);
    return successResponse(res, { account }, 'Payout account saved', HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const account = await payoutService.saveAccount(req.user, req.body, req.params.id);
    return successResponse(res, { account }, 'Payout account updated');
  } catch (error) {
    return next(error);
  }
};

const requestPayout = async (req, res, next) => {
  try {
    const payout = await payoutService.requestPayout(req.user, req.body);
    return successResponse(res, { payout }, 'Payout request submitted', HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

const listPayouts = async (req, res, next) => {
  try {
    const result = await payoutService.listPayouts(req.user, req.query);
    return successResponse(res, result, 'Payouts');
  } catch (error) {
    return next(error);
  }
};

const getPayout = async (req, res, next) => {
  try {
    const payout = await payoutService.getPayout(req.user, req.params.payoutId);
    return successResponse(res, { payout }, 'Payout');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAccount,
  createAccount,
  updateAccount,
  requestPayout,
  listPayouts,
  getPayout,
};
