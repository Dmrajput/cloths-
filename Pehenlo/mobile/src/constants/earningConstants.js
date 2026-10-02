export const EARNING_STATUS = {
  PENDING: 'PENDING',
  AVAILABLE: 'AVAILABLE',
  PAYOUT_PENDING: 'PAYOUT_PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  ADJUSTED: 'ADJUSTED',
};

export const EARNING_STATUS_LABELS = {
  PENDING: 'Pending settlement',
  AVAILABLE: 'Available',
  PAYOUT_PENDING: 'Payout processing',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  ADJUSTED: 'Adjusted',
};

export const EARNING_FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'AVAILABLE', label: 'Available' },
  { id: 'PAID', label: 'Paid' },
];

export const PAYOUT_STATUS_LABELS = {
  REQUESTED: 'Requested',
  PROCESSING: 'Processing',
  PAID: 'Paid',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export const EARNING_PAGE_SIZE = 10;
