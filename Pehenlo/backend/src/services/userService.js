const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Wishlist = require('../models/Wishlist');
const AppError = require('../utils/AppError');
const { storeListingImage } = require('./listingImageService');
const { HTTP_STATUS } = require('../utils/constants');

const GENDERS = ['', 'female', 'male', 'other', 'prefer_not_to_say'];

function cleanText(value, max) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

async function applyProfile(user, body) {
  const next = {};

  if (Object.prototype.hasOwnProperty.call(body, 'name')) {
    const name = cleanText(body.name, 60);
    if (name.length < 2) {
      throw new AppError('Name must be between 2 and 60 characters', HTTP_STATUS.BAD_REQUEST, 'INVALID_PROFILE_DATA');
    }
    next.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'email')) {
    const email = cleanText(body.email, 120).toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError('Enter a valid email address', HTTP_STATUS.BAD_REQUEST, 'INVALID_PROFILE_DATA');
    }
    next.email = email;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'city')) {
    next.city = cleanText(body.city, 80);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'state')) {
    next.state = cleanText(body.state, 80);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'gender')) {
    const gender = cleanText(body.gender, 32);
    if (!GENDERS.includes(gender)) {
      throw new AppError('Choose a valid gender option', HTTP_STATUS.BAD_REQUEST, 'INVALID_PROFILE_DATA');
    }
    next.gender = gender;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'dateOfBirth')) {
    if (!body.dateOfBirth) {
      next.dateOfBirth = null;
    } else {
      const date = new Date(body.dateOfBirth);
      if (Number.isNaN(date.getTime()) || date > new Date()) {
        throw new AppError('Enter a valid date of birth', HTTP_STATUS.BAD_REQUEST, 'INVALID_PROFILE_DATA');
      }
      next.dateOfBirth = date;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'bio')) {
    const bio = cleanText(body.bio, 250);
    if (String(body.bio || '').trim().length > 250) {
      throw new AppError('Bio must be 250 characters or fewer', HTTP_STATUS.BAD_REQUEST, 'INVALID_PROFILE_DATA');
    }
    next.bio = bio;
  }

  Object.assign(user, next);
  user.isProfileCompleted = Boolean(user.name && user.city);
  await user.save();
  const { notifyProfileUpdated } = require('./notificationService');
  await notifyProfileUpdated(user._id);
  return user;
}

async function summary(userId) {
  const [listingCount, rentalCount, wishlistCount] = await Promise.all([
    Listing.countDocuments({ owner: userId }),
    Booking.countDocuments({ renter: userId }),
    Wishlist.countDocuments({ user: userId }),
  ]);
  return { listingCount, rentalCount, wishlistCount };
}

async function setProfileImage(user, file, req) {
  try {
    const image = await storeListingImage(file, req);
    user.profileImage = image.url;
    await user.save();
    return { profileImage: image.url };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Photo upload failed', HTTP_STATUS.BAD_REQUEST, 'IMAGE_UPLOAD_FAILED');
  }
}

async function clearProfileImage(user) {
  user.profileImage = '';
  await user.save();
  return { profileImage: '' };
}

async function requestDeletion(user) {
  await Listing.updateMany(
    { owner: user._id, status: { $in: ['ACTIVE', 'PAUSED'] } },
    { $set: { status: 'PAUSED', isActive: false } }
  );
  await Wishlist.deleteMany({ user: user._id });

  user.name = 'Former member';
  user.email = '';
  user.bio = '';
  user.profileImage = '';
  user.city = '';
  user.state = '';
  user.isActive = false;
  user.isProfileCompleted = false;
  await user.save();

  return {
    deactivated: true,
    message: 'Your account is deactivated. Booking and payout records are kept for reconciliation.',
  };
}

module.exports = {
  applyProfile,
  summary,
  setProfileImage,
  clearProfileImage,
  requestDeletion,
  User,
};
