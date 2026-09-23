export function capitalize(value = '') {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function truncate(value = '', maxLength = 40) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

export function noop() {}

export default {
  capitalize,
  truncate,
  noop,
};
