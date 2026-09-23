import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius, shadows } = THEME;

const EarningsCard = ({
  label,
  amount,
  subtitle,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Text style={styles.amount}>{amount}</Text>

      {subtitle ? (
        <View style={styles.subtitleRow}>
          <View style={styles.accent} />
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.small,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  amount: {
    ...typography.display,
    fontSize: 28,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accent: {
    width: 3,
    height: 16,
    borderRadius: radius.xs,
    backgroundColor: colors.secondary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    flex: 1,
  },
});

export default EarningsCard;
