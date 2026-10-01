import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { bookingService } from '../../services/bookingService';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import { ErrorState } from '../../components/common';
import { formatDisplayDate } from '../../utils/bookingHelpers';
import { bookingErrorMessage } from '../../utils/bookingErrors';
import { formatINR, paymentResultState } from '../../utils/paymentHelpers';
import PaymentStatusBadge from '../../components/payment/PaymentStatusBadge';

const { colors, typography, spacing } = THEME;

const COPY = {
  SUCCESS: {
    title: 'Payment successful',
    body: 'Your booking is confirmed.',
  },
  FAILED: {
    title: 'Payment failed',
    body: 'Your booking is still pending payment. You can try again if the payment window is still active.',
  },
  EXPIRED: {
    title: 'Payment window expired',
    body: 'Your booking request has expired because payment was not completed in time.',
  },
  PENDING: {
    title: 'Payment verification pending',
    body: 'Please wait while we verify your payment.',
  },
};

const PaymentResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const bookingId = route.params?.bookingId;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      setError('This booking could not be found.');
      return;
    }
    setError('');
    try {
      const response = await bookingService.getBookingById(bookingId);
      setBooking(response?.data?.booking || null);
    } catch (loadError) {
      setError(bookingErrorMessage(loadError, 'Unable to confirm the payment status.'));
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  const state = paymentResultState(booking);
  const copy = COPY[state] || COPY.PENDING;

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {!loading && error ? <ErrorState title="Unable to confirm payment" message={error} onActionPress={load} /> : null}
      {!loading && booking ? (
        <View style={styles.content}>
          <PaymentStatusBadge status={booking.paymentStatus} />
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.body}>{copy.body}</Text>
          <Text style={styles.meta}>{booking.outfit?.title}</Text>
          <Text style={styles.meta}>{formatDisplayDate(booking.startDate)} – {formatDisplayDate(booking.endDate)}</Text>
          <Text style={styles.meta}>Total {formatINR(booking.totalIncludingDeposit)}</Text>
          <Text style={styles.meta}>Security deposit {formatINR(booking.securityDeposit)}</Text>
          <Text style={styles.reference}>Reference {booking.id}</Text>
          <PrimaryButton
            title="View Booking"
            onPress={() => navigation.replace('BookingDetails', { bookingId })}
            accessibilityLabel="View booking"
          />
          {state === 'FAILED' ? (
            <OutlineButton
              title="Try Again"
              onPress={() => navigation.replace('Payment', { bookingId })}
              accessibilityLabel="Try payment again"
              style={styles.second}
            />
          ) : null}
          {state === 'PENDING' ? (
            <OutlineButton title="Refresh status" onPress={load} accessibilityLabel="Refresh payment status" style={styles.second} />
          ) : null}
          <Pressable onPress={() => navigation.popToTop()} accessibilityRole="button" accessibilityLabel="Close" style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  meta: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.xs },
  reference: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.lg },
  second: { marginTop: spacing.sm },
  close: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  closeText: { ...typography.label, color: colors.primary },
});

export default PaymentResultScreen;
