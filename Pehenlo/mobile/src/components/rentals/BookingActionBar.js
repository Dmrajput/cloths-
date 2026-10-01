import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import PrimaryButton from '../buttons/PrimaryButton';
import OutlineButton from '../buttons/OutlineButton';
import { BOOKING_STATUS } from '../../constants/bookingConstants';
import { canCancelBooking, canOwnerAccept, canPayBooking } from '../../utils/rentalHelpers';

const { colors, typography, spacing } = THEME;

const BookingActionBar = ({ booking, busy, onPay, onCancel, onAccept, onReject }) => {
  if (!booking) return null;
  const pay = canPayBooking(booking);
  const cancel = canCancelBooking(booking);
  const ownerPending = canOwnerAccept(booking);

  if (!pay && !cancel && !ownerPending && booking.status === BOOKING_STATUS.PAYMENT_REQUIRED && booking.role === 'owner') {
    return <Text style={styles.wait}>Waiting for payment</Text>;
  }
  if (!pay && !cancel && !ownerPending) return null;

  return (
    <View style={styles.bar}>
      {pay ? <PrimaryButton title="Pay Now" onPress={onPay} loading={busy} accessibilityLabel="Pay now" /> : null}
      {ownerPending ? (
        <View style={styles.pair}>
          <OutlineButton title="Reject" onPress={onReject} disabled={busy} fullWidth={false} accessibilityLabel="Reject request" style={styles.half} />
          <PrimaryButton title="Accept" onPress={onAccept} loading={busy} fullWidth={false} accessibilityLabel="Accept request" style={styles.half} />
        </View>
      ) : null}
      {cancel ? (
        <OutlineButton
          title="Cancel Request"
          onPress={onCancel}
          loading={busy}
          accessibilityLabel="Cancel request"
          style={pay || ownerPending ? styles.second : null}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { marginTop: spacing.md },
  pair: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  second: { marginTop: spacing.sm },
  wait: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
});

export default BookingActionBar;
