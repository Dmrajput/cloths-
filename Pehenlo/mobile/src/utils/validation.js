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

export function normalizeIndianMobile(input) {
  const digits = String(input || '').replace(/\D/g, '');
  let national = digits;

  if (digits.length === 12 && digits.startsWith('91')) {
    national = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    national = digits.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(national)) {
    return null;
  }

  return `+91${national}`;
}

export function formatIndianPhone(e164) {
  const national = String(e164 || '').replace('+91', '');
  if (national.length !== 10) return e164 || '';
  return `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
}

export function getAuthErrorMessage(error) {
  const messages = {
    INVALID_PHONE: 'Enter a valid 10-digit mobile number.',
    INVALID_OTP: 'That OTP is incorrect.',
    OTP_EXPIRED: 'This OTP has expired. Request a new one.',
    OTP_ATTEMPTS_EXCEEDED: 'Too many attempts. Request a new OTP.',
    OTP_RATE_LIMITED: 'Too many OTP requests. Please wait and try again.',
    OTP_SEND_FAILED: 'Unable to send OTP right now. Please try again.',
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection and try again.',
    UNAUTHORIZED: 'Please sign in again.',
    TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
    INVALID_TOKEN: 'Your session is no longer valid. Please sign in again.',
  };

  if (error?.code && messages[error.code]) {
    return messages[error.code];
  }

  if (error?.code === 'PROFILE_VALIDATION_ERROR' && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export default {
  isRequired,
  isValidPhone,
  isValidEmail,
};
