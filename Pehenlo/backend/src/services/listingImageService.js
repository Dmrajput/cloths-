const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/listings');
const LOCAL_PREFIX = '/uploads/listings/';

function cloudinaryReady() {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

function safeLocalId(publicId) {
  return typeof publicId === 'string' && /^[a-zA-Z0-9._-]+$/.test(publicId);
}

function isTrustedImage(url, publicId) {
  if (typeof url !== 'string' || typeof publicId !== 'string' || !publicId) return false;
  let parsed;
  try {
    parsed = new URL(url);
  } catch (_error) {
    return false;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

  if (parsed.pathname.startsWith(LOCAL_PREFIX) && safeLocalId(publicId)) {
    return path.basename(parsed.pathname) === publicId;
  }

  if (
    cloudinaryReady()
    && parsed.hostname === 'res.cloudinary.com'
    && publicId.startsWith('pehenlo/listings/')
    && parsed.pathname.includes(`/${env.CLOUDINARY_CLOUD_NAME}/`)
    && parsed.pathname.includes(publicId.split('/').pop())
  ) {
    return true;
  }

  return false;
}

async function saveLocal(file, req) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const publicId = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.jpg`;
  await fs.writeFile(path.join(UPLOAD_DIR, publicId), file.buffer);
  const host = req.get('host');
  const url = `${req.protocol}://${host}${LOCAL_PREFIX}${publicId}`;
  return { url, publicId };
}

async function saveCloudinary(file) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'pehenlo/listings';
  const params = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(`${params}${env.CLOUDINARY_API_SECRET}`)
    .digest('hex');

  const body = new FormData();
  body.append('file', new Blob([file.buffer], { type: file.mimetype || 'image/jpeg' }), 'listing.jpg');
  body.append('api_key', env.CLOUDINARY_API_KEY);
  body.append('timestamp', String(timestamp));
  body.append('folder', folder);
  body.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.secure_url || !payload.public_id) {
    throw new AppError('Photo upload failed', 502, 'UPLOAD_FAILED');
  }
  return { url: payload.secure_url, publicId: payload.public_id };
}

async function storeListingImage(file, req) {
  if (!file || !file.buffer) {
    throw new AppError('Please choose a photo', HTTP_STATUS.BAD_REQUEST, 'IMAGE_REQUIRED');
  }
  if (cloudinaryReady()) {
    return saveCloudinary(file);
  }
  return saveLocal(file, req);
}

async function removeStoredImage(publicId) {
  if (safeLocalId(publicId)) {
    await fs.unlink(path.join(UPLOAD_DIR, publicId)).catch(() => {});
  }
}

module.exports = {
  isTrustedImage,
  storeListingImage,
  removeStoredImage,
};
