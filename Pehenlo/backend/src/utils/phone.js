const { PHONE } = require('./constants');

/**
 * Normalize an Indian mobile number to E.164 (+91XXXXXXXXXX).
 * Returns null when the number is not a valid 10-digit national number.
 */
function normalizePhone(input) {
  if (input == null) return null;

  const digits = String(input).replace(/\D/g, '');
  let national = digits;

  if (digits.length === PHONE.nationalLength + PHONE.countryDigits && digits.startsWith(PHONE.countryDigitsCode)) {
    national = digits.slice(PHONE.countryDigits);
  } else if (digits.length === PHONE.nationalLength + 1 && digits.startsWith('0')) {
    national = digits.slice(1);
  }

  if (!PHONE.nationalPattern.test(national)) {
    return null;
  }

  return `${PHONE.dialCode}${national}`;
}

function maskPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const last4 = digits.slice(-4);
  return last4 ? `****${last4}` : '****';
}

module.exports = { normalizePhone, maskPhone };
