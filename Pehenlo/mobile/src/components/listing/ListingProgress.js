import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { LISTING_STEPS } from '../../constants/listingConstants';

const { colors, typography, spacing } = THEME;

const ListingProgress = ({ step }) => (
  <View style={styles.wrap} accessibilityRole="text" accessibilityLabel={`Step ${step} of ${LISTING_STEPS.length}, ${LISTING_STEPS[step - 1]?.label || ''}`}>
    <Text style={styles.count}>Step {step} of {LISTING_STEPS.length}</Text>
    <View style={styles.row}>
      {LISTING_STEPS.map((item, index) => {
        const active = index < step;
        return (
          <View key={item.key} style={styles.step}>
            <View style={[styles.dot, active && styles.dotActive]} />
            {index < LISTING_STEPS.length - 1 ? <View style={[styles.line, active && styles.lineActive]} /> : null}
          </View>
        );
      })}
    </View>
    <Text style={styles.label}>{LISTING_STEPS[step - 1]?.label}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  count: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  lineActive: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

export default ListingProgress;
