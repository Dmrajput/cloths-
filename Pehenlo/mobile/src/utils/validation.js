/**
 * Lightweight form validators for Phase 1 UI.
 * Full auth validation arrives in Phase 2.
 */
export function isRequired(value) {
  if (value == null) return false;
  return String(value).trim().length > 0;
}

export function isValidPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidEmail(value) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export default {
  isRequired,
  isValidPhone,
  isValidEmail,
};
