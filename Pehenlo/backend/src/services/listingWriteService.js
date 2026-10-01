const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');
const { toOwnerListing } = require('../utils/catalogPresenter');
const { isTrustedImage, removeStoredImage } = require('./listingImageService');

const GENDERS = {
  female: 'female',
  women: 'female',
  male: 'male',
  men: 'male',
  unisex: 'unisex',
  kids: 'kids',
};

const CONDITIONS = {
  excellent: 'excellent',
  good: 'good',
  fair: 'fair',
  new: 'excellent',
  like_new: 'excellent',
  used: 'fair',
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', 'Custom'];
const SIZE_LOOKUP = Object.fromEntries(SIZES.map((size) => [size.toLowerCase(), size]));
const OCCASIONS = [
  'WEDDING', 'ENGAGEMENT', 'HALDI', 'MEHENDI', 'RECEPTION',
  'NAVRATRI', 'GARBA', 'FESTIVAL', 'PARTY', 'TRADITIONAL_FUNCTION',
];
const DURATIONS = [1, 2, 3, 5, 7];
const MEASUREMENT_KEYS = [
  'bust', 'chest', 'waist', 'hip', 'shoulder', 'sleeveLength', 'length', 'blouseLength', 'skirtLength',
];
const MAX_PRICE = 100000;
const MAX_DEPOSIT = 500000;
const MAX_FEE = 20000;
const EDITABLE = new Set(['DRAFT', 'REJECTED']);

const POPULATE = [
  { path: 'category', select: 'name slug' },
  { path: 'owner', select: 'name profileImage' },
];

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function readText(value, { max, allowEmpty = true } = {}) {
  if (value == null) return '';
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!allowEmpty && !trimmed) return null;
  if (trimmed.length > max) return null;
  return trimmed;
}

async function findOwned(userId, listingId) {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND, 'LISTING_NOT_FOUND');
  }
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND, 'LISTING_NOT_FOUND');
  }
  if (String(listing.owner) !== String(userId)) {
    throw new AppError('You can only change your own listing', HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }
  return listing;
}

function assignImages(listing, images) {
  if (!Array.isArray(images)) {
    return 'Add your photos again.';
  }
  if (images.length > 8) {
    return 'You can add up to 8 photos.';
  }
  const next = [];
  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    if (!isObject(image) || Array.isArray(image)) return 'A photo is invalid.';
    const url = typeof image.url === 'string' ? image.url.trim() : '';
    const publicId = typeof image.publicId === 'string' ? image.publicId.trim() : '';
    if (!isTrustedImage(url, publicId)) return 'Photos must be uploaded through Pehenlo.';
    next.push({ url, publicId, order: index });
  }
  const removed = (listing.images || []).filter(
    (image) => !next.some((item) => item.publicId === image.publicId)
  );
  removed.forEach((image) => {
    removeStoredImage(image.publicId);
  });
  listing.images = next;
  listing.coverImage = next[0]?.url || '';
  return '';
}

function assignMeasurements(value) {
  if (value == null) return { measurements: { unit: 'inches', notes: '' }, error: '' };
  if (!isObject(value) || Array.isArray(value)) {
    return { measurements: null, error: 'Measurements are invalid.' };
  }
  const unit = value.unit === 'cm' ? 'cm' : 'inches';
  const max = unit === 'cm' ? 400 : 160;
  const measurements = { unit, notes: '' };
  if (value.notes != null) {
    const notes = readText(value.notes, { max: 300 });
    if (notes == null) return { measurements: null, error: 'Measurement notes are too long.' };
    measurements.notes = notes;
  }
  for (const key of MEASUREMENT_KEYS) {
    if (value[key] == null || value[key] === '') continue;
    const number = Number(value[key]);
    if (!Number.isFinite(number) || number < 0 || number > max) {
      return { measurements: null, error: 'Enter measurements as positive numbers.' };
    }
    measurements[key] = number;
  }
  return { measurements, error: '' };
}

function assignAvailability(value) {
  if (value == null) return { availability: { mode: 'ALWAYS', blockedDates: [] }, error: '' };
  if (!isObject(value) || Array.isArray(value)) {
    return { availability: null, error: 'Availability is invalid.' };
  }
  const mode = value.mode === 'MANUAL' ? 'MANUAL' : value.mode === 'ALWAYS' ? 'ALWAYS' : '';
  if (!mode) return { availability: null, error: 'Choose how you want to manage availability.' };
  const dates = Array.isArray(value.blockedDates) ? value.blockedDates : [];
  if (dates.length > 90) return { availability: null, error: 'Too many blocked dates.' };
  const today = todayKey();
  const blockedDates = [];
  for (const date of dates) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { availability: null, error: 'A blocked date is invalid.' };
    }
    if (date < today) return { availability: null, error: 'Blocked dates must be today or later.' };
    if (!blockedDates.includes(date)) blockedDates.push(date);
  }
  return { availability: { mode, blockedDates }, error: '' };
}

async function applyPatch(listing, body) {
  const errors = {};
  if (!isObject(body) || Array.isArray(body)) {
    throw new AppError('Invalid listing', HTTP_STATUS.BAD_REQUEST, 'LISTING_VALIDATION', {
      listing: 'Listing details are invalid.',
    });
  }

  const setText = (field, max) => {
    if (!Object.prototype.hasOwnProperty.call(body, field)) return;
    const value = readText(body[field], { max });
    if (value == null) errors[field] = 'This value is invalid.';
    else listing[field] = value;
  };

  setText('title', 100);
  setText('description', 1000);
  setText('brand', 80);
  setText('city', 60);
  setText('state', 60);
  setText('pickupArea', 80);
  setText('conditionNotes', 500);
  setText('damageDescription', 500);

  if (Object.prototype.hasOwnProperty.call(body, 'color')) {
    const color = readText(body.color, { max: 30 });
    if (color == null) errors.color = 'Color is invalid.';
    else listing.color = color;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'gender') && body.gender != null && body.gender !== '') {
    const gender = GENDERS[String(body.gender).toLowerCase()];
    if (!gender) errors.gender = 'Choose a valid gender.';
    else listing.gender = gender;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'condition') && body.condition != null && body.condition !== '') {
    const condition = CONDITIONS[String(body.condition).toLowerCase().replace(/\s+/g, '_')];
    if (!condition) errors.condition = 'Choose a valid condition.';
    else listing.condition = condition;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'size') && body.size != null && body.size !== '') {
    const size = SIZE_LOOKUP[String(body.size).toLowerCase()];
    if (!size) errors.size = 'Choose a valid size.';
    else listing.size = size;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'category') && body.category) {
    const categoryId = String(body.category);
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      errors.category = 'Choose a valid category.';
    } else {
      const category = await Category.findOne({ _id: categoryId, isActive: true }).select('_id');
      if (!category) errors.category = 'Choose a valid category.';
      else listing.category = category._id;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'occasion')) {
    if (!Array.isArray(body.occasion) || body.occasion.some((item) => typeof item !== 'string')) {
      errors.occasion = 'Occasions are invalid.';
    } else {
      const unique = [...new Set(body.occasion.map((item) => item.trim().toUpperCase()))];
      if (unique.some((item) => !OCCASIONS.includes(item))) errors.occasion = 'Choose a valid occasion.';
      else listing.occasion = unique;
    }
  }

  const setMoney = (field, { min, max, label }) => {
    if (!Object.prototype.hasOwnProperty.call(body, field)) return;
    if (typeof body[field] === 'object') {
      errors[field] = `${label} is invalid.`;
      return;
    }
    const number = Number(body[field]);
    if (!Number.isFinite(number) || number < min || number > max) {
      errors[field] = `${label} is invalid.`;
      return;
    }
    listing[field] = number;
  };

  setMoney('price', { min: 0, max: MAX_PRICE, label: 'Rental price' });
  setMoney('securityDeposit', { min: 0, max: MAX_DEPOSIT, label: 'Security deposit' });
  setMoney('cleaningFee', { min: 0, max: MAX_FEE, label: 'Cleaning fee' });
  setMoney('deliveryFee', { min: 0, max: MAX_FEE, label: 'Delivery fee' });

  if (Object.prototype.hasOwnProperty.call(body, 'rentalDuration') && body.rentalDuration != null && body.rentalDuration !== '') {
    const duration = Number(body.rentalDuration);
    if (!DURATIONS.includes(duration)) errors.rentalDuration = 'Choose a rental duration.';
    else listing.rentalDuration = duration;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'images')) {
    const imageError = assignImages(listing, body.images);
    if (imageError) errors.images = imageError;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'measurements')) {
    const result = assignMeasurements(body.measurements);
    if (result.error) errors.measurements = result.error;
    else listing.measurements = result.measurements;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'availability')) {
    const result = assignAvailability(body.availability);
    if (result.error) errors.availability = result.error;
    else listing.availability = result.availability;
  }

  ['pickupAvailable', 'deliveryAvailable', 'hasDamage'].forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(body, field)) return;
    if (typeof body[field] !== 'boolean') errors[field] = 'This value is invalid.';
    else listing[field] = body[field];
  });

  if (!listing.hasDamage) listing.damageDescription = listing.damageDescription || '';

  if (Object.keys(errors).length) {
    throw new AppError(
      'Please check the listing details',
      HTTP_STATUS.BAD_REQUEST,
      'LISTING_VALIDATION',
      errors
    );
  }
}

function submissionErrors(listing) {
  const errors = {};
  if (!listing.images || listing.images.length < 1) errors.images = 'At least one photo is required.';
  if (!listing.title || listing.title.trim().length < 5) errors.title = 'Title must be at least 5 characters.';
  if (!listing.description || listing.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters.';
  }
  if (!listing.category) errors.category = 'Category is required.';
  if (!listing.gender) errors.gender = 'Gender is required.';
  if (!listing.size) errors.size = 'Size is required.';
  if (!listing.condition) errors.condition = 'Condition is required.';
  if (!(listing.price > 0)) errors.price = 'Rental price must be greater than 0.';
  if (!DURATIONS.includes(listing.rentalDuration)) errors.rentalDuration = 'Choose a rental duration.';
  if (listing.securityDeposit == null || listing.securityDeposit < 0) {
    errors.securityDeposit = 'Security deposit is required.';
  }
  if (!listing.city) errors.city = 'City is required.';
  if (!listing.state) errors.state = 'State is required.';
  if (!listing.pickupAvailable && !listing.deliveryAvailable) {
    errors.pickupAvailable = 'Choose pickup, delivery, or both.';
  }
  if (listing.pickupAvailable && !listing.pickupArea) {
    errors.pickupArea = 'Add an area or locality for pickup.';
  }
  if (listing.hasDamage && (!listing.damageDescription || listing.damageDescription.length < 5)) {
    errors.damageDescription = 'Describe the visible damage or defect.';
  }
  return errors;
}

async function present(listing) {
  await listing.populate(POPULATE);
  return toOwnerListing(listing);
}

async function createDraft(user, body) {
  const listing = new Listing({
    owner: user._id,
    status: 'DRAFT',
    isActive: false,
    isFeatured: false,
  });
  await applyPatch(listing, body || {});
  listing.status = 'DRAFT';
  listing.isActive = false;
  listing.owner = user._id;
  await listing.save();
  return present(listing);
}

async function updateOwnedListing(user, listingId, body) {
  const listing = await findOwned(user._id, listingId);
  if (!EDITABLE.has(listing.status)) {
    throw new AppError('This listing can no longer be edited', HTTP_STATUS.BAD_REQUEST, 'LISTING_LOCKED');
  }
  await applyPatch(listing, body || {});
  if (listing.status === 'REJECTED') listing.status = 'DRAFT';
  listing.isActive = false;
  listing.owner = user._id;
  await listing.save();
  return present(listing);
}

async function submitOwnedListing(user, listingId) {
  const listing = await findOwned(user._id, listingId);
  if (listing.status !== 'DRAFT') {
    throw new AppError('Only a draft can be submitted', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS');
  }
  const errors = submissionErrors(listing);
  if (Object.keys(errors).length) {
    throw new AppError(
      'Please complete all required listing fields',
      HTTP_STATUS.BAD_REQUEST,
      'LISTING_VALIDATION',
      errors
    );
  }
  listing.status = 'PENDING_APPROVAL';
  listing.isActive = false;
  await listing.save();
  return {
    listingId: String(listing._id),
    status: listing.status,
  };
}

async function listMine(user) {
  const listings = await Listing.find({ owner: user._id })
    .sort({ updatedAt: -1 })
    .populate(POPULATE);
  return listings.map((listing) => toOwnerListing(listing));
}

async function listMyDrafts(user) {
  const listings = await Listing.find({ owner: user._id, status: 'DRAFT' })
    .sort({ updatedAt: -1 })
    .populate(POPULATE);
  return listings.map((listing) => toOwnerListing(listing));
}

async function deleteOwnedListing(user, listingId) {
  const listing = await findOwned(user._id, listingId);
  if (!EDITABLE.has(listing.status)) {
    throw new AppError('This listing cannot be deleted', HTTP_STATUS.BAD_REQUEST, 'LISTING_LOCKED');
  }
  (listing.images || []).forEach((image) => removeStoredImage(image.publicId));
  await listing.deleteOne();
}

async function deleteOwnedImage(user, listingId, imageId) {
  const listing = await findOwned(user._id, listingId);
  if (!EDITABLE.has(listing.status)) {
    throw new AppError('This listing can no longer be edited', HTTP_STATUS.BAD_REQUEST, 'LISTING_LOCKED');
  }
  const image = (listing.images || []).find((item) => String(item._id) === String(imageId));
  if (!image) throw new AppError('Photo not found', HTTP_STATUS.NOT_FOUND, 'IMAGE_NOT_FOUND');
  if ((listing.images || []).length <= 1 && listing.status !== 'DRAFT' && listing.status !== 'REJECTED') {
    throw new AppError('At least one photo is required', HTTP_STATUS.BAD_REQUEST, 'IMAGE_REQUIRED');
  }
  listing.images = listing.images.filter((item) => String(item._id) !== String(imageId));
  listing.images.forEach((item, index) => {
    item.order = index;
  });
  listing.coverImage = listing.images[0]?.url || '';
  await listing.save();
  await removeStoredImage(image.publicId);
  return present(listing);
}

module.exports = {
  createDraft,
  updateOwnedListing,
  submitOwnedListing,
  listMine,
  listMyDrafts,
  deleteOwnedListing,
  deleteOwnedImage,
};
