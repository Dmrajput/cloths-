import { getMeasurementFields } from '../constants/listingConstants';
import {
  validateListingAvailability,
  validateListingDelivery,
  validateListingDetails,
  validateListingMeasurements,
  validateListingPhotos,
  validateListingPricing,
} from './listingValidation';

export function createEmptyDraft(user) {
  return {
    localId: `local-${Date.now()}`,
    id: null,
    photos: [],
    title: '',
    description: '',
    category: null,
    gender: null,
    brand: '',
    color: '',
    occasion: [],
    size: '',
    measurements: { unit: 'inches', notes: '' },
    condition: '',
    conditionNotes: '',
    hasDamage: false,
    damageDescription: '',
    price: '',
    rentalDuration: null,
    securityDeposit: '',
    cleaningFee: '0',
    availabilityMode: 'ALWAYS',
    blockedDates: [],
    pickupAvailable: false,
    deliveryAvailable: false,
    pickupArea: '',
    deliveryFee: '',
    city: user?.city || '',
    state: user?.state || '',
    status: 'DRAFT',
    updatedAt: Date.now(),
  };
}

export function draftFromListing(listing) {
  const measurements = { unit: listing.measurements?.unit || 'inches', notes: listing.measurements?.notes || '' };
  ['bust', 'chest', 'waist', 'hip', 'shoulder', 'sleeveLength', 'length', 'blouseLength', 'skirtLength'].forEach((key) => {
    if (listing.measurements?.[key] != null) measurements[key] = String(listing.measurements[key]);
  });
  return {
    localId: listing.id,
    id: listing.id,
    photos: (listing.images || []).map((image) => ({
      id: image.id,
      url: image.url,
      publicId: image.publicId,
      localUri: image.url,
    })),
    title: listing.title || '',
    description: listing.description || '',
    category: listing.category
      ? { id: listing.category.id, slug: listing.category.slug, name: listing.category.name }
      : null,
    gender: listing.gender || null,
    brand: listing.brand || '',
    color: listing.color || '',
    occasion: listing.occasion || [],
    size: listing.size || '',
    measurements,
    condition: listing.condition || '',
    conditionNotes: listing.conditionNotes || '',
    hasDamage: Boolean(listing.hasDamage),
    damageDescription: listing.damageDescription || '',
    price: listing.price ? String(listing.price) : '',
    rentalDuration: listing.rentalDays || null,
    securityDeposit: listing.securityDeposit != null ? String(listing.securityDeposit) : '',
    cleaningFee: listing.cleaningFee != null ? String(listing.cleaningFee) : '0',
    availabilityMode: listing.availability?.mode || 'ALWAYS',
    blockedDates: listing.availability?.blockedDates || [],
    pickupAvailable: Boolean(listing.pickupAvailable),
    deliveryAvailable: Boolean(listing.deliveryAvailable),
    pickupArea: listing.pickupArea || '',
    deliveryFee: listing.deliveryFee ? String(listing.deliveryFee) : '',
    city: listing.city || '',
    state: listing.state || '',
    status: listing.status || 'DRAFT',
    rejectionReason: listing.rejectionReason || '',
    updatedAt: listing.updatedAt ? new Date(listing.updatedAt).getTime() : Date.now(),
  };
}

export function draftToPayload(draft) {
  const measurements = {
    unit: draft.measurements?.unit === 'cm' ? 'cm' : 'inches',
    notes: draft.measurements?.notes || '',
  };
  getMeasurementFields(draft.category?.slug, draft.gender).forEach((field) => {
    if (draft.measurements?.[field.key] !== '' && draft.measurements?.[field.key] != null) {
      measurements[field.key] = Number(draft.measurements[field.key]);
    }
  });
  const payload = {
    title: draft.title?.trim() || '',
    description: draft.description?.trim() || '',
    gender: draft.gender,
    brand: draft.brand?.trim() || '',
    color: draft.color === 'Other' ? '' : (draft.color || ''),
    occasion: draft.occasion || [],
    images: (draft.photos || [])
      .filter((photo) => photo.url && photo.publicId)
      .map((photo) => ({ url: photo.url, publicId: photo.publicId })),
    size: draft.size,
    measurements,
    condition: draft.condition,
    conditionNotes: draft.conditionNotes?.trim() || '',
    hasDamage: Boolean(draft.hasDamage),
    damageDescription: draft.hasDamage ? (draft.damageDescription?.trim() || '') : '',
    price: draft.price === '' ? 0 : Number(draft.price),
    rentalDuration: draft.rentalDuration,
    securityDeposit: draft.securityDeposit === '' ? 0 : Number(draft.securityDeposit),
    cleaningFee: draft.cleaningFee === '' ? 0 : Number(draft.cleaningFee || 0),
    availability: {
      mode: draft.availabilityMode || 'ALWAYS',
      blockedDates: draft.blockedDates || [],
    },
    pickupAvailable: Boolean(draft.pickupAvailable),
    deliveryAvailable: Boolean(draft.deliveryAvailable),
    pickupArea: draft.pickupArea?.trim() || '',
    deliveryFee: draft.deliveryFee === '' ? 0 : Number(draft.deliveryFee || 0),
    city: draft.city?.trim() || '',
    state: draft.state?.trim() || '',
  };
  if (draft.category?.id) payload.category = draft.category.id;
  return payload;
}

export function draftProgress(draft) {
  const checks = [
    validateListingPhotos(draft).ok,
    validateListingDetails(draft).ok,
    validateListingMeasurements(draft).ok,
    validateListingPricing(draft).ok,
    validateListingAvailability(draft).ok,
    validateListingDelivery(draft).ok,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function firstIncompleteRoute(draft) {
  if (!validateListingPhotos(draft).ok) return 'ListingPhotos';
  if (!validateListingDetails(draft).ok) return 'ListingDetails';
  if (!validateListingMeasurements(draft).ok) return 'ListingMeasurements';
  if (!validateListingPricing(draft).ok) return 'ListingPricing';
  if (!validateListingAvailability(draft).ok) return 'ListingAvailability';
  if (!validateListingDelivery(draft).ok) return 'ListingDelivery';
  return 'ListingReview';
}

export function moneyLabel(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '₹0';
  return `₹${number.toLocaleString('en-IN')}`;
}

export function monthDays(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const start = first.getDay();
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let index = 0; index < start; index += 1) cells.push(null);
  for (let day = 1; day <= count; day += 1) {
    const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ day, key });
  }
  return cells;
}

export function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
