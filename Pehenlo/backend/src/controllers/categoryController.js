const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const { toPublicCategory } = require('../utils/catalogPresenter');
const { HTTP_STATUS } = require('../utils/constants');

const getCategories = async (req, res, next) => {
  try {
    const activeOnly = req.query.active !== 'false';
    const filter = activeOnly ? { isActive: true } : {};
    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });

    return successResponse(res, {
      categories: categories.map(toPublicCategory),
    }, 'Categories');
  } catch (error) {
    return next(new AppError('Unable to load categories', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'CATEGORIES_FETCH_FAILED'));
  }
};

module.exports = { getCategories };
