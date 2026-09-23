import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const SecondaryButton = ({
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
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.secondaryLight,
    paddingVertical: spacing.md + 2,
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
    opacity: 0.85,
  },
  disabled: {
    backgroundColor: colors.disabled,
  },
  text: {
    ...typography.button,
    color: colors.primaryDark,
  },
});

export default SecondaryButton;
