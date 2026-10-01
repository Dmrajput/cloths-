import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { getPaymentStatusLabel } from '../../utils/rentalHelpers';

const { colors, typography, spacing, radius } = THEME;

function tone(status) {
  if (status === 'PAID' || status === 'REFUNDED') return colors.success;
  if (status === 'FAILED' || status === 'EXPIRED') return colors.error;
  if (status === 'PENDING' || status === 'PROCESSING' || status === 'REFUND_PENDING' || status === 'PARTIALLY_REFUNDED') return colors.warning;
  return colors.textSecondary;
}

const PaymentStatusBadge = ({ status }) => {
  const label = getPaymentStatusLabel(status);
  return (
    <View style={styles.badge} accessibilityLabel={label}>
      <Text style={[styles.text, { color: tone(status) }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: { ...typography.caption },
});

export default PaymentStatusBadge;
