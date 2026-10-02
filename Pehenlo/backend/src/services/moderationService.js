const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');

const FLAG_PATTERNS = [
  /\b[6-9]\d{9}\b/,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b(upi|whatsapp|paytm|gpay|phonepe)\b/i,
  /pay\s+me|send\s+money|pay\s+directly|direct\s+payment|off[\s-]?platform/i,
  /https?:\/\//i,
  /\b(fuck|bastard|kill you)\b/i,
];

function needsModeration(text) {
  const value = String(text || '');
  return FLAG_PATTERNS.some((pattern) => pattern.test(value));
}

function assertPlainText(value, label) {
  if (/[<>]/.test(String(value || ''))) {
    throw new AppError(`${label} cannot include HTML`, HTTP_STATUS.BAD_REQUEST, 'INVALID_REVIEW_CONTENT');
  }
}

module.exports = {
  needsModeration,
  assertPlainText,
};
