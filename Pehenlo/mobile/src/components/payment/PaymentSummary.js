import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/paymentHelpers';

const { colors, typography, spacing, radius } = THEME;

function Row({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.value, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

const PaymentSummary = ({ booking }) => {
  if (!booking) return null;
  return (
    <View style={styles.card} accessibilityLabel="Payment summary">
      <Row label="Rental" value={formatINR(booking.rentalSubtotal)} />
      <Row label="Cleaning fee" value={formatINR(booking.cleaningFee)} />
      <Row label="Delivery fee" value={formatINR(booking.deliveryFee)} />
      <Row label="Platform fee" value={formatINR(booking.platformFee)} />
      <View style={styles.divider} />
      <Row label="Rental and service total" value={formatINR(booking.totalBeforeDeposit)} />
      <Row label="Refundable security deposit" value={formatINR(booking.securityDeposit)} />
      <Text style={styles.note}>Refundable after the rental is completed, subject to Pehenlo’s damage and return policy.</Text>
      <Row label="Total payable" value={formatINR(booking.totalIncludingDeposit)} strong />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: { ...typography.body, color: colors.textSecondary, flex: 1, marginRight: spacing.sm },
  value: { ...typography.label, color: colors.textPrimary },
  strong: { ...typography.h3, color: colors.primary },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginBottom: spacing.sm },
  note: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },
});

export default PaymentSummary;
