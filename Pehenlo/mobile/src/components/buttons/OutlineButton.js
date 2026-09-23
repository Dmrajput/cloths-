import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const OutlineButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Text style={[styles.text, isDisabled && styles.textDisabled, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    backgroundColor: colors.surfaceSecondary,
  },
  disabled: {
    borderColor: colors.disabled,
  },
  text: {
    ...typography.button,
    color: colors.primary,
  },
  textDisabled: {
    color: colors.textMuted,
  },
});

export default OutlineButton;
