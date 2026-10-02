import { EARNING_STATUS_LABELS, PAYOUT_STATUS_LABELS } from '../constants/earningConstants';

const MESSAGES = {
  INSUFFICIENT_AVAILABLE_BALANCE: 'That amount is more than your available balance.',
  MINIMUM_PAYOUT_NOT_REACHED: 'This amount is below the minimum payout.',
  PAYOUT_ACCOUNT_REQUIRED: 'Add a payout account before withdrawing.',
  PAYOUT_ACCOUNT_NOT_VERIFIED: 'This payout account is not ready.',
  PAYOUT_ALREADY_PROCESSING: 'A payout request is already being processed.',
  PAYOUT_NOT_FOUND: 'This payout could not be found.',
  UNAUTHORIZED_PAYOUT_ACCESS: 'You cannot view this payout.',
  EARNING_NOT_FOUND: 'This earning could not be found.',
  UNAUTHORIZED_EARNING_ACCESS: 'You cannot view this earning.',
  INVALID_PAYOUT_AMOUNT: 'Enter a valid amount in rupees.',
  NETWORK_ERROR: 'Couldn’t reach Pehenlo. Check your connection and try again.',
};

export function earningErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return fallback;
}

export function earningStatusLabel(status) {
  return EARNING_STATUS_LABELS[status] || 'Earning';
}

export function payoutStatusLabel(status) {
  return PAYOUT_STATUS_LABELS[status] || 'Payout';
}

export function parseRupeeInput(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits);
}
