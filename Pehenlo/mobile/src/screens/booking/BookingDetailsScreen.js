import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { BOOKING_STATUS, REJECTION_REASONS } from '../../constants/bookingConstants';
import { rentalService } from '../../services/rentalService';
import BookingPriceBreakdown from '../../components/booking/BookingPriceBreakdown';
import BookingStatusBadge from '../../components/rentals/BookingStatusBadge';
import PaymentStatusBadge from '../../components/rentals/PaymentStatusBadge';
import BookingTimeline from '../../components/rentals/BookingTimeline';
import BookingActionBar from '../../components/rentals/BookingActionBar';
import DateRangeSummary from '../../components/booking/DateRangeSummary';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import AppTextArea from '../../components/inputs/AppTextArea';
import { ErrorState } from '../../components/common';
import { countdownLabel, rupees } from '../../utils/bookingHelpers';
import { bookingErrorMessage } from '../../utils/bookingErrors';
import {
  canCancelBooking,
  canOwnerAccept,
  canPayBooking,
  formatEventTime,
  formatLongDate,
  fulfillmentLabel,
  rentalAttention,
  securityDepositNote,
} from '../../utils/rentalHelpers';

const { colors, typography, spacing, radius } = THEME;

const BookingDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const bookingId = route.params?.bookingId;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  const [otherReason, setOtherReason] = useState('');

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!bookingId) {
      setLoading(false);
      setError('This booking could not be found.');
      return;
    }
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const response = await rentalService.getBookingDetails(bookingId);
      setBooking(response?.data?.booking || null);
    } catch (loadError) {
      setError(bookingErrorMessage(loadError, 'Unable to load this booking.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pending = booking?.status === BOOKING_STATUS.PENDING_OWNER_APPROVAL;
  const expiredLocally = pending && booking?.bookingExpiresAt && new Date(booking.bookingExpiresAt).getTime() <= now;
  const isOwner = booking?.role === 'owner';
  const countdown = countdownLabel(booking?.bookingExpiresAt, now);
  const attention = rentalAttention(booking, now);

  const run = async (work, success) => {
    setBusy(true);
    setActionError('');
    try {
      const response = await work();
      setBooking(response?.data?.booking || null);
      setRejecting(false);
      if (success) Alert.alert(success);
    } catch (actionErrorResult) {
      setActionError(bookingErrorMessage(actionErrorResult, 'This booking was updated. Refresh to see the latest status.'));
      load({ silent: true });
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    Alert.alert(
      'Cancel this booking?',
      `${booking?.outfit?.title || 'Outfit'}\n${formatLongDate(booking?.startDate)} – ${formatLongDate(booking?.endDate)}\nThis action cannot be undone.`,
      [
        { text: 'Keep booking', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: () => run(() => rentalService.cancelBooking(bookingId), 'Booking cancelled'),
        },
      ]
    );
  };

  const accept = () => {
    Alert.alert(
      'Accept rental request?',
      `${booking?.outfit?.title || 'Outfit'}\n${formatLongDate(booking?.startDate)} – ${formatLongDate(booking?.endDate)}\n${booking?.renter?.name || 'Renter'}\nRental ${rupees(booking?.totalBeforeDeposit)}`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Accept Request',
          onPress: () => run(() => rentalService.acceptBooking(bookingId), 'Booking accepted. Waiting for renter payment.'),
        },
      ]
    );
  };

  const reject = () => {
    const text = reason === 'Other' ? otherReason.trim() : reason;
    run(() => rentalService.rejectBooking(bookingId, text), 'Booking rejected');
  };

  const openOutfit = () => {
    if (!booking?.outfit?.available || !booking?.outfit?.id) return;
    navigation.navigate('OutfitDetails', { listingId: booking.outfit.id });
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.header}>Booking</Text>
        <Pressable onPress={() => load({ silent: true })} accessibilityRole="button" accessibilityLabel="Refresh booking" style={styles.back}>
          <Text style={styles.refresh}>Refresh</Text>
        </Pressable>
      </View>
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {!loading && error ? <ErrorState title="Unable to load booking" message={error} onActionPress={() => load()} /> : null}
      {!loading && booking ? (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ silent: true })} tintColor={colors.primary} />}
          >
            <View style={styles.badges}>
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge status={booking.paymentStatus} />
            </View>
            <Pressable onPress={openOutfit} disabled={!booking.outfit?.available} accessibilityRole="button" accessibilityLabel={booking.outfit?.title || 'Outfit'}>
              <View style={styles.outfit}>
                {booking.outfit?.coverImage ? (
                  <Image source={{ uri: booking.outfit.coverImage }} style={styles.image} />
                ) : <View style={styles.image} />}
                <View style={styles.outfitCopy}>
                  <Text style={styles.title}>{booking.outfit?.title}</Text>
                  {booking.outfit?.category ? <Text style={styles.body}>{booking.outfit.category}</Text> : null}
                  {booking.outfit?.size ? <Text style={styles.body}>Size {booking.outfit.size}</Text> : null}
                  {booking.outfit?.color ? <Text style={styles.body}>{booking.outfit.color}</Text> : null}
                  {booking.outfit?.city ? <Text style={styles.body}>{booking.outfit.city}</Text> : null}
                  {booking.outfit?.available ? <Text style={styles.link}>View outfit</Text> : <Text style={styles.body}>Outfit no longer available</Text>}
                </View>
              </View>
            </Pressable>
            {booking.bookingReference ? <Text style={styles.reference}>{booking.bookingReference}</Text> : null}
            {attention ? <Text style={styles.notice}>{attention}</Text> : null}
            {booking.status === BOOKING_STATUS.REJECTED ? (
              <Text style={styles.notice}>
                Booking request declined.{booking.rejectedReason ? ` Reason: ${booking.rejectedReason}` : ''}
              </Text>
            ) : null}
            {booking.status === BOOKING_STATUS.CANCELLED ? <Text style={styles.notice}>This booking was cancelled.</Text> : null}
            <Text style={styles.section}>Rental dates</Text>
            <Text style={styles.body}>Rental start {formatLongDate(booking.startDate)}</Text>
            <Text style={styles.body}>Return date {formatLongDate(booking.endDate)}</Text>
            <DateRangeSummary startDate={booking.startDate} endDate={booking.endDate} minimumDays={1} />
            {pending && !expiredLocally ? (
              <Text style={styles.timer}>{isOwner ? `Respond within ${countdown}` : `Expires in ${countdown}`}</Text>
            ) : null}
            <Text style={styles.section}>Fulfillment</Text>
            <Text style={styles.body}>{fulfillmentLabel(booking.fulfillmentMethod)}</Text>
            {booking.fulfillmentMethod === 'PICKUP' ? <Text style={styles.body}>{booking.pickupArea || 'Pickup area will be shared later.'}</Text> : null}
            {booking.fulfillmentMethod === 'DELIVERY' && booking.deliveryAddress ? (
              <Text style={styles.body}>
                {[booking.deliveryAddress.addressLine1, booking.deliveryAddress.area, booking.deliveryAddress.city, booking.deliveryAddress.state, booking.deliveryAddress.pincode].filter(Boolean).join(', ')}
              </Text>
            ) : null}
            {booking.fulfillmentMethod === 'DELIVERY' && booking.deliveryArea ? (
              <Text style={styles.body}>{[booking.deliveryArea.area, booking.deliveryArea.city, booking.deliveryArea.state].filter(Boolean).join(', ')}</Text>
            ) : null}
            <Text style={styles.section}>{isOwner ? 'Renter' : 'Owner'}</Text>
            <Text style={styles.body}>{isOwner ? booking.renter?.name : booking.owner?.name}</Text>
            {booking.renterNote ? <Text style={styles.body}>Note: {booking.renterNote}</Text> : null}
            {booking.ownerNote ? <Text style={styles.body}>Owner note: {booking.ownerNote}</Text> : null}
            <Text style={styles.section}>Payment</Text>
            <Text style={styles.body}>{securityDepositNote(booking)}</Text>
            {booking.paymentCompletedAt ? <Text style={styles.body}>Paid {formatEventTime(booking.paymentCompletedAt)}</Text> : null}
            {booking.paymentStatus === 'FAILED' && booking.paymentFailureReason ? <Text style={styles.body}>{booking.paymentFailureReason}</Text> : null}
            {isOwner ? null : booking.razorpayOrderId ? <Text style={styles.reference}>Order {booking.razorpayOrderId}</Text> : null}
            <BookingPriceBreakdown pricing={booking} paid={booking.paymentStatus === 'PAID'} />
            <BookingTimeline steps={booking.timeline || []} />
            {actionError ? <Text style={styles.formError}>{actionError}</Text> : null}
            {!isOwner && (booking.status === BOOKING_STATUS.EXPIRED || booking.status === BOOKING_STATUS.REJECTED) ? (
              <View style={styles.actions}>
                <PrimaryButton
                  title="Choose New Dates"
                  onPress={() => navigation.navigate('Availability', { listingId: booking.outfit?.id })}
                  accessibilityLabel="Choose new dates"
                />
                <OutlineButton
                  title="Find Similar Outfits"
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Explore', params: { navToken: Date.now() } })}
                  accessibilityLabel="Find similar outfits"
                  style={styles.second}
                />
              </View>
            ) : null}
            {isOwner && rejecting ? (
              <View>
                {REJECTION_REASONS.map((item) => (
                  <Pressable key={item} onPress={() => setReason(item)} style={styles.reason} accessibilityRole="button" accessibilityLabel={item}>
                    <Text style={styles.body}>{reason === item ? '●' : '○'} {item}</Text>
                  </Pressable>
                ))}
                {reason === 'Other' ? (
                  <AppTextArea label="Reason" value={otherReason} onChangeText={setOtherReason} maxLength={500} />
                ) : null}
                <PrimaryButton title="Decline request" onPress={reject} loading={busy} accessibilityLabel="Decline request" />
              </View>
            ) : null}
          </ScrollView>
          {(canPayBooking(booking, now) || canCancelBooking(booking, now) || canOwnerAccept(booking, now) || (isOwner && booking.status === BOOKING_STATUS.PAYMENT_REQUIRED)) ? (
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <BookingActionBar
                booking={booking}
                busy={busy}
                onPay={() => navigation.navigate('Payment', { bookingId })}
                onCancel={cancel}
                onAccept={accept}
                onReject={() => setRejecting(true)}
              />
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  back: { minWidth: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { ...typography.h2, color: colors.textPrimary },
  refresh: { ...typography.caption, color: colors.primary },
  header: { ...typography.h3, color: colors.textPrimary },
  loader: { marginTop: spacing.xl },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  outfit: { flexDirection: 'row', marginTop: spacing.md },
  image: { width: 84, height: 104, borderRadius: radius.sm, backgroundColor: colors.surfaceSecondary },
  outfitCopy: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.h3, color: colors.textPrimary },
  reference: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  notice: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
  timer: { ...typography.label, color: colors.primary, marginTop: spacing.md },
  section: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg },
  body: { ...typography.body, color: colors.textPrimary, marginTop: spacing.xs },
  link: { ...typography.label, color: colors.primary, marginTop: spacing.xs },
  formError: { ...typography.body, color: colors.error, marginTop: spacing.md },
  actions: { marginTop: spacing.md },
  second: { marginTop: spacing.sm },
  reason: { minHeight: 44, justifyContent: 'center' },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});

export default BookingDetailsScreen;
