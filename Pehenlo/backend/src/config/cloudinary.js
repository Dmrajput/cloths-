// Cloudinary will be configured later when media upload is implemented.
const env = require('./env');

module.exports = {
  cloudName: env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: env.CLOUDINARY_API_KEY || '',
  apiSecret: env.CLOUDINARY_API_SECRET || '',
};
