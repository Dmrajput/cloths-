import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { BOOKING_STATUS_LABELS } from '../../constants/bookingConstants';

const { colors, typography, spacing, radius } = THEME;

const TONES = {
  PENDING_OWNER_APPROVAL: { background: colors.surfaceSecondary, text: colors.secondary },
  PAYMENT_REQUIRED: { background: colors.surfaceSecondary, text: colors.warning },
  CONFIRMED: { background: colors.surfaceSecondary, text: colors.success },
  ACTIVE: { background: colors.surfaceSecondary, text: colors.success },
  RETURN_PENDING: { background: colors.surfaceSecondary, text: colors.warning },
  COMPLETED: { background: colors.surfaceSecondary, text: colors.success },
  DISPUTED: { background: colors.surfaceSecondary, text: colors.error },
  REJECTED: { background: colors.surfaceSecondary, text: colors.error },
  CANCELLED: { background: colors.surfaceSecondary, text: colors.textSecondary },
  EXPIRED: { background: colors.surfaceSecondary, text: colors.textSecondary },
};

const BookingStatusBadge = ({ status }) => {
  const tone = TONES[status] || TONES.CANCELLED;
  const label = BOOKING_STATUS_LABELS[status] || status;
  return (
    <View style={[styles.badge, { backgroundColor: tone.background }]} accessibilityLabel={label}>
      <Text style={[styles.text, { color: tone.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.caption,
  },
});

export default BookingStatusBadge;
