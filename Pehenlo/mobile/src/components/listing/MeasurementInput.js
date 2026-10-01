import { StyleSheet, Text, TextInput, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const MeasurementInput = ({ label, value, onChangeText, error, unit = 'inches' }) => (
  <View style={styles.wrap}>
    <Text style={styles.label}>{label} ({unit})</Text>
    <TextInput
      value={value == null ? '' : String(value)}
      onChangeText={(text) => onChangeText(text.replace(/[^\d.]/g, ''))}
      keyboardType="decimal-pad"
      placeholder="Optional"
      placeholderTextColor={colors.textMuted}
      accessibilityLabel={`${label} in ${unit}`}
      style={[styles.input, error && styles.inputError]}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    width: '48%',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default MeasurementInput;
