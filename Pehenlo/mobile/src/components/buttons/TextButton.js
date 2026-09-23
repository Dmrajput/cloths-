import { Pressable, StyleSheet, Text } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing } = THEME;

const TextButton = ({
  title,
  onPress,
  disabled = false,
  color = colors.primary,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: disabled ? colors.textMuted : color },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    ...typography.button,
  },
});

export default TextButton;
