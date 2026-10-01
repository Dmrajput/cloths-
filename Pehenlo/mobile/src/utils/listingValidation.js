import {
  MAX_FEE,
  MAX_LISTING_PHOTOS,
  MAX_RENTAL_PRICE,
  MAX_SECURITY_DEPOSIT,
  getMeasurementFields,
} from '../constants/listingConstants';

function text(value) {
  return String(value || '').trim();
}

function numberOrNull(value) {
  if (value == null || value === '') return null;
  if (!/^\d+(\.\d+)?$/.test(String(value).trim())) return null;
  return Number(value);
}

export function validateListingPhotos(draft) {
  const errors = {};
  const ready = (draft?.photos || []).filter((photo) => photo.url || photo.localUri);
  if (ready.length < 1) errors.photos = 'Please add at least one photo.';
  if ((draft?.photos || []).length > MAX_LISTING_PHOTOS) {
    errors.photos = 'You can add up to 8 photos.';
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateListingDetails(draft) {
  const errors = {};
  const title = text(draft?.title);
  const description = text(draft?.description);
  if (title.length < 5) errors.title = 'Title must be at least 5 characters.';
  if (title.length > 100) errors.title = 'Title must be 100 characters or less.';
  if (description.length < 20) errors.description = 'Description must be at least 20 characters.';
  if (description.length > 1000) errors.description = 'Description must be 1,000 characters or less.';
  if (!draft?.category?.id) errors.category = 'Choose a category.';
  if (!draft?.gender) errors.gender = 'Choose who this outfit is for.';
  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateListingMeasurements(draft) {
  const errors = {};
  if (!draft?.size) errors.size = 'Choose a size.';
  if (!draft?.condition) errors.condition = 'Choose the outfit condition.';
  const fields = getMeasurementFields(draft?.category?.slug, draft?.gender);
  const unit = draft?.measurements?.unit === 'cm' ? 'cm' : 'inches';
  const max = unit === 'cm' ? 400 : 160;
  fields.forEach((field) => {
    const raw = draft?.measurements?.[field.key];
    if (raw == null || raw === '') return;
    const number = numberOrNull(raw);
    if (number == null || number < 0 || number > max) {
      errors[field.key] = `Enter ${field.label.toLowerCase()} as a number.`;
    }
  });
  if (text(draft?.conditionNotes).length > 500) {
    errors.conditionNotes = 'Condition notes must be 500 characters or less.';
  }
  if (draft?.hasDamage && text(draft?.damageDescription).length < 5) {
    errors.damageDescription = 'Describe the visible damage or defect.';
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateListingPricing(draft) {
  const errors = {};
  const price = numberOrNull(draft?.price);
  const deposit = draft?.securityDeposit === '' || draft?.securityDeposit == null
    ? null
    : numberOrNull(draft.securityDeposit);
  const cleaning = draft?.cleaningFee === '' || draft?.cleaningFee == null
    ? 0
    : numberOrNull(draft.cleaningFee);
  if (price == null || price <= 0 || price > MAX_RENTAL_PRICE) {
    errors.price = 'Enter a rental price greater than 0.';
  }
  if (![1, 2, 3, 5, 7].includes(draft?.rentalDuration)) {
    errors.rentalDuration = 'Choose a rental duration.';
  }
  if (deposit == null || deposit < 0 || deposit > MAX_SECURITY_DEPOSIT) {
    errors.securityDeposit = 'Enter a security deposit of 0 or more.';
  }
  if (cleaning == null || cleaning < 0 || cleaning > MAX_FEE) {
    errors.cleaningFee = 'Enter a cleaning fee of 0 or more.';
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateListingAvailability(draft) {
  const errors = {};
  if (!['ALWAYS', 'MANUAL'].includes(draft?.availabilityMode)) {
    errors.availability = 'Choose how you want to manage availability.';
  }
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  (draft?.blockedDates || []).forEach((date) => {
    if (date < todayKey) errors.availability = 'Blocked dates must be today or later.';
  });
  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateListingDelivery(draft) {
  const errors = {};
  if (!draft?.pickupAvailable && !draft?.deliveryAvailable) {
    errors.receiving = 'Choose pickup, delivery, or both.';
  }
  if (!text(draft?.city)) errors.city = 'City is required.';
  if (!text(draft?.state)) errors.state = 'State is required.';
  if (draft?.pickupAvailable && !text(draft?.pickupArea)) {
    errors.pickupArea = 'Add an area or locality for pickup. Do not enter your house number.';
  }
  if (draft?.deliveryAvailable && draft?.deliveryFee !== '' && draft?.deliveryFee != null) {
    const fee = numberOrNull(draft.deliveryFee);
    if (fee == null || fee < 0 || fee > MAX_FEE) errors.deliveryFee = 'Enter a delivery fee of 0 or more.';
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateCompleteListing(draft) {
  const parts = [
    validateListingPhotos(draft),
    validateListingDetails(draft),
    validateListingMeasurements(draft),
    validateListingPricing(draft),
    validateListingAvailability(draft),
    validateListingDelivery(draft),
  ];
  const errors = Object.assign({}, ...parts.map((part) => part.errors));
  const uploaded = (draft?.photos || []).filter((photo) => photo.url);
  if (!uploaded.length) errors.photos = 'Please upload at least one photo.';
  return { ok: Object.keys(errors).length === 0, errors };
}
