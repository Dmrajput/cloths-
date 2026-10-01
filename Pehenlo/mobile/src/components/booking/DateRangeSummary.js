import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { formatDisplayDate, rentalDays } from '../../utils/bookingHelpers';

const { colors, typography, spacing } = THEME;

const DateRangeSummary = ({ startDate, endDate, minimumDays }) => {
  const days = startDate && endDate ? rentalDays(startDate, endDate) : 0;
  return (
    <View style={styles.wrap} accessibilityLabel="Rental period">
      <Text style={styles.label}>Rental period</Text>
      {startDate && endDate ? (
        <>
          <Text style={styles.value}>{formatDisplayDate(startDate)} → {formatDisplayDate(endDate)}</Text>
          <Text style={styles.meta}>{days} day{days === 1 ? '' : 's'}</Text>
        </>
      ) : (
        <Text style={styles.meta}>
          {startDate ? `Start ${formatDisplayDate(startDate)}. Choose a return date.` : `Select at least ${minimumDays} day${minimumDays === 1 ? '' : 's'}.`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default DateRangeSummary;
