import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const DateInput = ({
  label,
  value,
  placeholder = 'Select date',
  error,
  disabled = false,
  onPress,
  style,
}) => {
  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.inputContainer,
          error && styles.inputError,
          disabled && styles.inputDisabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.value,
            isPlaceholder && styles.placeholder,
            disabled && styles.valueDisabled,
          ]}
          numberOfLines={1}
        >
          {displayValue}
        </Text>

        <Ionicons
          name="calendar-outline"
          size={20}
          color={disabled ? colors.disabled : colors.textMuted}
        />
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceSecondary,
  },
  pressed: {
    borderColor: colors.primary,
  },
  value: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  placeholder: {
    color: colors.textMuted,
  },
  valueDisabled: {
    color: colors.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default DateInput;
