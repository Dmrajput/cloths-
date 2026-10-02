import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { earningStatusLabel, payoutStatusLabel } from '../../utils/earningHelpers';

const { colors, typography, spacing, radius } = THEME;

function tone(status) {
  if (status === 'AVAILABLE' || status === 'PAID') return colors.success;
  if (status === 'FAILED' || status === 'CANCELLED') return colors.error;
  if (status === 'PENDING' || status === 'PAYOUT_PENDING' || status === 'REQUESTED' || status === 'PROCESSING') return colors.warning;
  return colors.textSecondary;
}

const EarningStatusBadge = ({ status, kind = 'earning' }) => {
  const label = kind === 'payout' ? payoutStatusLabel(status) : earningStatusLabel(status);
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

export default EarningStatusBadge;
