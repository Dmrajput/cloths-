import { Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius, shadows } = THEME;

const SectionCard = ({
  title,
  children,
  style,
  actionLabel,
  onActionPress,
}) => {
  const showHeader = title || actionLabel;

  return (
    <View style={[styles.card, style]}>
      {showHeader ? (
        <View style={styles.header}>
          {title ? (
            <Text style={styles.title}>{title}</Text>
          ) : (
            <View />
          )}

          {actionLabel && onActionPress ? (
            <Pressable
              onPress={onActionPress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
            >
              <Text style={styles.action}>{actionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {children}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  action: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default SectionCard;
