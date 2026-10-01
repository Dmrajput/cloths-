export const LISTING_STEPS = [
  { key: 'photos', label: 'Photos', route: 'ListingPhotos' },
  { key: 'details', label: 'Details', route: 'ListingDetails' },
  { key: 'condition', label: 'Condition', route: 'ListingMeasurements' },
  { key: 'price', label: 'Price', route: 'ListingPricing' },
  { key: 'availability', label: 'Availability', route: 'ListingAvailability' },
  { key: 'delivery', label: 'Delivery', route: 'ListingDelivery' },
  { key: 'review', label: 'Review', route: 'ListingReview' },
];

export const PLATFORM_COMMISSION_PERCENT = 15;

export const MAX_LISTING_PHOTOS = 8;
export const MIN_LISTING_PHOTOS = 1;

export const GENDER_OPTIONS = [
  { value: 'female', label: 'Women' },
  { value: 'male', label: 'Men' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids', label: 'Kids' },
];

export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', 'Custom'];

export const CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Used' },
];

export const COLOR_OPTIONS = [
  'Red', 'Maroon', 'Pink', 'Green', 'Blue', 'Yellow', 'Orange',
  'White', 'Black', 'Gold', 'Silver', 'Multicolor', 'Other',
];

export const OCCASION_OPTIONS = [
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'ENGAGEMENT', label: 'Engagement' },
  { value: 'HALDI', label: 'Haldi' },
  { value: 'MEHENDI', label: 'Mehendi' },
  { value: 'RECEPTION', label: 'Reception' },
  { value: 'NAVRATRI', label: 'Navratri' },
  { value: 'GARBA', label: 'Garba' },
  { value: 'FESTIVAL', label: 'Festival' },
  { value: 'PARTY', label: 'Party' },
  { value: 'TRADITIONAL_FUNCTION', label: 'Traditional Function' },
];

export const DURATION_OPTIONS = [
  { value: 1, label: '1 Day' },
  { value: 2, label: '2 Days' },
  { value: 3, label: '3 Days' },
  { value: 5, label: '5 Days' },
  { value: 7, label: '7 Days' },
];

export const MAX_RENTAL_PRICE = 100000;
export const MAX_SECURITY_DEPOSIT = 500000;
export const MAX_FEE = 20000;

export const MEASUREMENT_LABELS = {
  bust: 'Bust',
  chest: 'Chest',
  waist: 'Waist',
  hip: 'Hip',
  shoulder: 'Shoulder',
  sleeveLength: 'Sleeve length',
  length: 'Length',
  blouseLength: 'Blouse length',
  skirtLength: 'Skirt length',
};

const MEASUREMENTS_BY_CATEGORY = {
  lehenga: ['bust', 'waist', 'hip', 'length', 'blouseLength', 'sleeveLength'],
  saree: ['length'],
  'chaniya-choli': ['bust', 'waist', 'hip', 'blouseLength', 'skirtLength'],
  anarkali: ['bust', 'waist', 'hip', 'length'],
  sharara: ['waist', 'hip', 'length'],
  gharara: ['waist', 'hip', 'length'],
  sherwani: ['chest', 'waist', 'shoulder', 'sleeveLength', 'length'],
  kurta: ['chest', 'waist', 'shoulder', 'sleeveLength', 'length'],
  kediyu: ['chest', 'waist', 'shoulder', 'sleeveLength', 'length'],
  'nehru-jacket': ['chest', 'shoulder'],
  'indo-western': ['bust', 'waist', 'hip', 'length'],
  dupatta: [],
  pagdi: [],
  jewellery: [],
  'traditional-accessories': [],
};

export function getMeasurementFields(categorySlug, gender) {
  const keys = MEASUREMENTS_BY_CATEGORY[categorySlug] || ['bust', 'waist', 'hip', 'length'];
  const adjusted = gender === 'male'
    ? keys.map((key) => (key === 'bust' ? 'chest' : key))
    : keys;
  return [...new Set(adjusted)].map((key) => ({
    key,
    label: MEASUREMENT_LABELS[key] || key,
  }));
}

export function genderLabel(value) {
  return GENDER_OPTIONS.find((option) => option.value === value)?.label || '';
}

export function conditionLabel(value) {
  return CONDITION_OPTIONS.find((option) => option.value === value)?.label || '';
}

export function durationLabel(value) {
  return DURATION_OPTIONS.find((option) => option.value === value)?.label || '';
}

export function occasionLabel(value) {
  return OCCASION_OPTIONS.find((option) => option.value === value)?.label || value;
}
