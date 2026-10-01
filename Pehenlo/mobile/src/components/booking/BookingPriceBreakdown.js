import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { rupees } from '../../utils/bookingHelpers';

const { colors, typography, spacing, radius } = THEME;

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const BookingPriceBreakdown = ({ pricing, paid = false }) => {
  if (!pricing) return null;
  return (
    <View style={styles.card} accessibilityLabel="Price breakdown">
      <Row label="Rental price" value={rupees(pricing.rentalSubtotal)} />
      {Number(pricing.cleaningFee) > 0 ? <Row label="Cleaning fee" value={rupees(pricing.cleaningFee)} /> : null}
      {Number(pricing.deliveryFee) > 0 ? <Row label="Delivery fee" value={rupees(pricing.deliveryFee)} /> : null}
      {Number(pricing.platformFee) > 0 ? <Row label="Pehenlo fee" value={rupees(pricing.platformFee)} /> : null}
      <View style={styles.divider} />
      <Row label={paid ? 'Rental and service total' : 'Amount to be paid later'} value={rupees(pricing.totalBeforeDeposit)} />
      <Row label="Refundable security deposit" value={rupees(pricing.securityDeposit)} />
      <Text style={styles.note}>Refundable after return, subject to Pehenlo’s damage and return policy.</Text>
      <Text style={styles.estimate}>{paid ? 'Total paid' : 'Total payable'} {rupees(pricing.totalIncludingDeposit)}</Text>
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
  label: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    ...typography.label,
    color: colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginBottom: spacing.sm,
  },
  note: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  estimate: {
    ...typography.h3,
    color: colors.primary,
  },
});

export default BookingPriceBreakdown;
