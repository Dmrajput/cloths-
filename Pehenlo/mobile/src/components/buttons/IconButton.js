import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { colors, spacing, radius } = THEME;

const IconButton = ({
  name = 'ellipsis-horizontal',
  onPress,
  size = 22,
  color = colors.textPrimary,
  backgroundColor = 'transparent',
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || name}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      hitSlop={8}
    >
      <Ionicons name={name} size={size} color={disabled ? colors.disabled : color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: colors.surfaceSecondary,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default IconButton;
