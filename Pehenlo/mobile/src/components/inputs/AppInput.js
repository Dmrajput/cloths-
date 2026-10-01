import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const AppInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  keyboardType = 'default',
  maxLength,
  autoCapitalize = 'sentences',
  autoCorrect = true,
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

      <View
        style={[
          styles.inputContainer,
          { borderColor },
          disabled && styles.inputDisabled,
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={20}
            color={disabled ? colors.disabled : colors.textMuted}
            style={styles.leftIcon}
          />
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, disabled && styles.inputTextDisabled]}
        />

        {rightIcon ? (
          onRightIconPress ? (
            <Pressable
              onPress={onRightIconPress}
              disabled={disabled}
              hitSlop={8}
              style={styles.rightIconButton}
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={disabled ? colors.disabled : colors.textMuted}
              />
            </Pressable>
          ) : (
            <Ionicons
              name={rightIcon}
              size={20}
              color={disabled ? colors.disabled : colors.textMuted}
              style={styles.rightIcon}
            />
          )
        ) : null}
      </View>

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
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceSecondary,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  inputTextDisabled: {
    color: colors.textMuted,
  },
  rightIconButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default AppInput;
