import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const AppTextArea = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled = false,
  numberOfLines = 4,
  style,
}) => {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        editable={!disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.textArea,
          { borderColor },
          disabled && styles.textAreaDisabled,
        ]}
      />

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
  textArea: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 100,
  },
  textAreaDisabled: {
    backgroundColor: colors.surfaceSecondary,
    color: colors.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default AppTextArea;
