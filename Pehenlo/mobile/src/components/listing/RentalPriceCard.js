import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

function rupees(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

const RentalPriceCard = ({ price, durationLabel, securityDeposit, cleaningFee }) => (
  <View style={styles.card} accessibilityLabel={`Rental price ${rupees(price)} for ${durationLabel}`}>
    <Text style={styles.price}>{rupees(price)}</Text>
    <Text style={styles.duration}>for {durationLabel}</Text>
    <View style={styles.row}>
      <Text style={styles.label}>Security deposit</Text>
      <Text style={styles.value}>{rupees(securityDeposit)}</Text>
    </View>
    <Text style={styles.note}>Refundable after return, subject to Pehenlo’s damage and return policy.</Text>
    {Number(cleaningFee) > 0 ? (
      <View style={styles.row}>
        <Text style={styles.label}>Cleaning fee</Text>
        <Text style={styles.value}>{rupees(cleaningFee)}</Text>
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  price: {
    ...typography.h1,
    color: colors.primary,
  },
  duration: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  value: {
    ...typography.label,
    color: colors.textPrimary,
  },
  note: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default RentalPriceCard;
