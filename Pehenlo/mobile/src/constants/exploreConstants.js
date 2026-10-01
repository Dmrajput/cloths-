export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Rating: High to Low' },
  { value: 'views_desc', label: 'Most Viewed' },
];

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

export const RATING_OPTIONS = [
  { value: 4, label: '4★ & above' },
  { value: 3, label: '3★ & above' },
  { value: 2, label: '2★ & above' },
];

export const CITY_OPTIONS = ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot'];

export const EXPLORE_PAGE_SIZE = 20;

export function emptyFilters() {
  return {
    category: [],
    gender: null,
    minPrice: null,
    maxPrice: null,
    size: [],
    condition: [],
    minRating: null,
    city: null,
    occasion: null,
    source: null,
  };
}

export function genderLabel(value) {
  return GENDER_OPTIONS.find((option) => option.value === value)?.label || value;
}

export function conditionLabel(value) {
  return CONDITION_OPTIONS.find((option) => option.value === value)?.label || value;
}

export function sortLabel(value) {
  return SORT_OPTIONS.find((option) => option.value === value)?.label || 'Recommended';
}
