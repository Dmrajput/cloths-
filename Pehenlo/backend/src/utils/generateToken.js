const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (payload) => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
