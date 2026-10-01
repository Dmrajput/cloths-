export const BOOKING_STATUS = {
  PENDING_OWNER_APPROVAL: 'PENDING_OWNER_APPROVAL',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  ACTIVE: 'ACTIVE',
  RETURN_PENDING: 'RETURN_PENDING',
  COMPLETED: 'COMPLETED',
  DISPUTED: 'DISPUTED',
  EXPIRED: 'EXPIRED',
};

export const BOOKING_STATUS_LABELS = {
  PENDING_OWNER_APPROVAL: 'Waiting for Owner',
  PAYMENT_REQUIRED: 'Payment Required',
  CONFIRMED: 'Confirmed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  ACTIVE: 'Active Rental',
  RETURN_PENDING: 'Return Pending',
  COMPLETED: 'Completed',
  DISPUTED: 'Under Dispute',
  EXPIRED: 'Expired',
};

export const REJECTION_REASONS = [
  'Dates not available',
  'Outfit maintenance',
  'Personal reason',
  'Other',
];

export const FULFILLMENT = {
  PICKUP: 'PICKUP',
  DELIVERY: 'DELIVERY',
};
