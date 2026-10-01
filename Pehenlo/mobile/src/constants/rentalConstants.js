import { BOOKING_STATUS } from './bookingConstants';
import { PAYMENT_STATUS_LABELS } from './paymentConstants';

export const RENTAL_ROLE = {
  RENTER: 'renter',
  OWNER: 'owner',
};

export const RENTER_TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'active', label: 'Active' },
  { id: 'past', label: 'Past' },
];

export const OWNER_TABS = [
  { id: 'requests', label: 'Requests' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'active', label: 'Active' },
  { id: 'past', label: 'Past' },
];

export const PERSPECTIVE_TABS = [
  { id: 'renter', label: 'My Rentals' },
  { id: 'owner', label: 'My Outfit Rentals' },
];

export const RENTAL_GROUPS = {
  renter: {
    upcoming: [
      BOOKING_STATUS.PENDING_OWNER_APPROVAL,
      BOOKING_STATUS.PAYMENT_REQUIRED,
      BOOKING_STATUS.CONFIRMED,
    ],
    active: [BOOKING_STATUS.ACTIVE, BOOKING_STATUS.RETURN_PENDING],
    past: [
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.REJECTED,
      BOOKING_STATUS.EXPIRED,
      BOOKING_STATUS.DISPUTED,
    ],
  },
  owner: {
    requests: [BOOKING_STATUS.PENDING_OWNER_APPROVAL],
    upcoming: [BOOKING_STATUS.PAYMENT_REQUIRED, BOOKING_STATUS.CONFIRMED],
    active: [BOOKING_STATUS.ACTIVE, BOOKING_STATUS.RETURN_PENDING],
    past: [
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.REJECTED,
      BOOKING_STATUS.EXPIRED,
      BOOKING_STATUS.DISPUTED,
    ],
  },
};

export const EMPTY_RENTALS = {
  renter: {
    upcoming: {
      title: 'No upcoming rentals',
      message: 'Find an outfit for your next occasion.',
      action: 'Explore Outfits',
    },
    active: {
      title: 'No active rentals',
      message: 'Rentals appear here once the booking is active.',
      action: 'Explore Outfits',
    },
    past: {
      title: 'No past rentals yet',
      message: 'Completed and closed bookings will appear here.',
      action: 'Explore Outfits',
    },
  },
  owner: {
    requests: {
      title: 'No rental requests',
      message: 'New requests for your outfits will appear here.',
      action: 'View My Listings',
    },
    upcoming: {
      title: 'No upcoming outfit rentals',
      message: 'Accepted bookings that are waiting or confirmed will appear here.',
      action: '',
    },
    active: {
      title: 'No active outfit rentals',
      message: 'Active rentals of your outfits will appear here.',
      action: '',
    },
    past: {
      title: 'No past outfit rentals',
      message: 'Completed and closed rentals of your outfits will appear here.',
      action: '',
    },
  },
};

export const PAYMENT_LABELS = PAYMENT_STATUS_LABELS;

export const PAGE_SIZE = 10;
