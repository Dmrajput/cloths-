import { emptyFilters } from '../constants/exploreConstants';

function setParam(params, key, value) {
  if (value == null || value === '') return;
  if (Array.isArray(value)) {
    if (value.length) params[key] = value.join(',');
    return;
  }
  params[key] = String(value);
}

export function buildListingQueryParams({
  page,
  limit,
  search,
  sort,
  filters = {},
} = {}) {
  const params = {};
  setParam(params, 'page', page);
  setParam(params, 'limit', limit);
  setParam(params, 'search', search?.trim());
  setParam(params, 'sort', sort && sort !== 'recommended' ? sort : undefined);
  setParam(params, 'category', filters.category);
  setParam(params, 'gender', filters.gender);
  setParam(params, 'city', filters.city);
  setParam(params, 'minPrice', filters.minPrice);
  setParam(params, 'maxPrice', filters.maxPrice);
  setParam(params, 'size', filters.size);
  setParam(params, 'condition', filters.condition);
  setParam(params, 'minRating', filters.minRating);
  setParam(params, 'occasion', filters.occasion);
  setParam(params, 'source', filters.source);
  return params;
}

export function countActiveFilterGroups(filters = {}) {
  let count = 0;
  if (filters.category?.length) count += 1;
  if (filters.gender) count += 1;
  if (filters.minPrice != null || filters.maxPrice != null) count += 1;
  if (filters.size?.length) count += 1;
  if (filters.condition?.length) count += 1;
  if (filters.minRating != null) count += 1;
  if (filters.city) count += 1;
  if (filters.occasion) count += 1;
  if (filters.source) count += 1;
  return count;
}

export function cloneFilters(filters) {
  const base = emptyFilters();
  return {
    ...base,
    ...filters,
    category: [...(filters?.category || [])],
    size: [...(filters?.size || [])],
    condition: [...(filters?.condition || [])],
  };
}

export function formatPriceChip(minPrice, maxPrice) {
  const min = minPrice != null ? `₹${Number(minPrice).toLocaleString('en-IN')}` : null;
  const max = maxPrice != null ? `₹${Number(maxPrice).toLocaleString('en-IN')}` : null;
  if (min && max) return `${min}–${max}`;
  if (min) return `${min}+`;
  if (max) return `Up to ${max}`;
  return '';
}
