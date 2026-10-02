const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');
const reportService = require('../services/reportService');

const createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport(req.user._id, req.body || {});
    return successResponse(res, { report }, 'Report submitted', HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const reports = await reportService.listMine(req.user._id);
    return successResponse(res, { reports }, 'Reports');
  } catch (error) {
    return next(error);
  }
};

module.exports = { createReport, getMyReports };
