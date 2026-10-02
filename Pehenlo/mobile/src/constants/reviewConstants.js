export const REVIEW_TYPES = {
  OUTFIT: 'OUTFIT_REVIEW',
  OWNER: 'OWNER_REVIEW',
  RENTER: 'RENTER_REVIEW',
};

export const REVIEW_TYPE_LABELS = {
  OUTFIT_REVIEW: 'Review Outfit',
  OWNER_REVIEW: 'Review Owner',
  RENTER_REVIEW: 'Review Renter',
};

export const REVIEW_STATUS_LABELS = {
  PUBLISHED: 'Published',
  PENDING_MODERATION: 'Under review',
  REJECTED: 'Review could not be published',
  HIDDEN: 'Hidden',
  DELETED: 'Deleted',
};

export const REVIEW_SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
];
