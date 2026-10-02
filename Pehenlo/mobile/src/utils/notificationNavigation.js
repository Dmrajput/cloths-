import { navigateWhenReady } from '../navigation/navigationRef';

const pending = [];

export function openNotificationTarget(data) {
  const action = data?.action;
  const go = (name, params) => {
    if (!navigateWhenReady(name, params)) pending.push({ name, params });
  };
  if (action === 'OPEN_BOOKING' && data.bookingId) return go('BookingDetails', { bookingId: data.bookingId });
  if (action === 'OPEN_PAYMENT' && data.bookingId) return go('Payment', { bookingId: data.bookingId });
  if (action === 'OPEN_LISTING' && data.listingId) return go('OutfitDetails', { listingId: data.listingId });
  if (action === 'OPEN_REVIEW' && data.listingId) return go('Reviews', { listingId: data.listingId });
  if (action === 'OPEN_EARNING' && data.earningId) return go('EarningDetails', { earningId: data.earningId });
  if (action === 'OPEN_PAYOUT' && data.payoutId) return go('PayoutDetails', { payoutId: data.payoutId });
  if (action === 'OPEN_PROFILE' && data.userId) return go('PublicProfile', { userId: data.userId });
  if (action === 'OPEN_SAFETY') return go('SafetyCenter');
  return go('Notifications');
}

export function flushPendingNotifications() {
  while (pending.length && navigateWhenReady(pending[0].name, pending[0].params)) {
    pending.shift();
  }
}

export function clearPendingNotifications() {
  pending.length = 0;
}
