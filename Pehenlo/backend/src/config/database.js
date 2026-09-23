const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  if (!env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set — skipping database connection');
    return;
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection failed:', err.message);
  }
};

module.exports = connectDB;
