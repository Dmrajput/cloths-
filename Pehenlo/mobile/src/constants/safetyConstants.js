export const REPORT_TARGETS = {
  LISTING: 'LISTING',
  USER: 'USER',
  REVIEW: 'REVIEW',
  BOOKING: 'BOOKING',
};

export const REPORT_REASONS = [
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
  { value: 'MISLEADING_LISTING', label: 'Misleading listing' },
  { value: 'FAKE_REVIEW', label: 'Fake review' },
  { value: 'FRAUD_SUSPICION', label: 'Fraud suspicion' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'ABUSIVE_BEHAVIOR', label: 'Abusive behavior' },
  { value: 'SCAM', label: 'Scam' },
  { value: 'COUNTERFEIT_ITEM', label: 'Suspected counterfeit' },
  { value: 'PROHIBITED_ITEM', label: 'Prohibited item' },
  { value: 'SAFETY_CONCERN', label: 'Safety concern' },
  { value: 'OTHER', label: 'Other' },
];

export const SAFETY_SECTIONS = [
  {
    title: 'Before renting',
    body: 'Check photos, size, measurements, condition, and rental dates. The booking details are the source of truth.',
  },
  {
    title: 'Before paying',
    body: 'Pay only through Pehenlo’s payment flow. Never share your OTP, UPI PIN, card PIN, CVV, or banking password.',
  },
  {
    title: 'During pickup',
    body: 'Use the agreed pickup arrangement. Prefer a public place, and do not share more personal information than the booking needs. Pehenlo does not physically verify pickup locations.',
  },
  {
    title: 'After the rental',
    body: 'Return the outfit according to the booking terms. A review can be left after the rental is completed and paid.',
  },
  {
    title: 'If something goes wrong',
    body: 'Report the listing, person, review, or booking. A report is reviewed later. It does not cancel a booking or change a payment.',
  },
  {
    title: 'Account safety',
    body: 'Keep bookings and payments inside Pehenlo. Do not send money outside the app, and do not share one-time passwords.',
  },
];
