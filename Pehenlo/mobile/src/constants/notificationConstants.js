export const NOTIFICATION_CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'BOOKING', label: 'Bookings' },
  { value: 'PAYMENT', label: 'Payments' },
  { value: 'EARNING', label: 'Earnings' },
  { value: 'REVIEW', label: 'Reviews' },
  { value: 'LISTING', label: 'Listings' },
  { value: 'SAFETY', label: 'Safety' },
];

export const CATEGORY_ICONS = {
  BOOKING: 'calendar-outline',
  PAYMENT: 'card-outline',
  EARNING: 'wallet-outline',
  REVIEW: 'star-outline',
  LISTING: 'shirt-outline',
  SAFETY: 'shield-checkmark-outline',
  ACCOUNT: 'person-outline',
  SYSTEM: 'notifications-outline',
};

export const PREFERENCE_ROWS = [
  { key: 'pushEnabled', label: 'Push notifications', hint: 'Phone alerts. In-app notifications still appear when this is off.' },
  { key: 'booking', label: 'Booking updates' },
  { key: 'payment', label: 'Payment updates' },
  { key: 'earnings', label: 'Earnings and payouts' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'listings', label: 'Listing updates' },
  { key: 'safety', label: 'Safety and security' },
  { key: 'account', label: 'Account updates' },
];
