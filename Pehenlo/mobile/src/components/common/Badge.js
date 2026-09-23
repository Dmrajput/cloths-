import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const VARIANTS = {
  primary: {
    backgroundColor: colors.primaryLight,
    color: colors.textLight,
  },
  success: {
    backgroundColor: colors.success,
    color: colors.textLight,
  },
  warning: {
    backgroundColor: colors.warning,
    color: colors.textLight,
  },
  error: {
    backgroundColor: colors.error,
    color: colors.textLight,
  },
  muted: {
    backgroundColor: colors.surfaceSecondary,
    color: colors.textSecondary,
  },
};

const Badge = ({ label, variant = 'primary', style }) => {
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;

  return (
    <View
      style={[styles.container, { backgroundColor: variantStyle.backgroundColor }, style]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Text style={[styles.label, { color: variantStyle.color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});

export default Badge;
