import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';
import { AppTextArea } from '../../components/inputs';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { REPORT_REASONS } from '../../constants/safetyConstants';
import { safetyService } from '../../services/safetyService';

const { colors, typography, spacing, radius } = THEME;

const ReportScreen = () => {
  const navigation = useNavigation();
  const { targetType, targetId } = useRoute().params || {};
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!reason || saving) return;
    setSaving(true);
    setError('');
    try {
      await safetyService.reportTarget({
        targetType,
        targetId,
        reason,
        description: description.trim(),
      });
      Alert.alert('Report submitted', "Thank you for helping keep Pehenlo safe. We'll review the information.");
      navigation.goBack();
    } catch (saveError) {
      setError(saveError.message || 'Could not submit the report.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="Submit Report" showBack onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.label}>Reason</Text>
        {REPORT_REASONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setReason(option.value)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: reason === option.value }}
            style={[styles.reason, reason === option.value && styles.reasonOn]}
          >
            <Text style={styles.reasonText}>{option.label}</Text>
          </Pressable>
        ))}
        <AppTextArea label="Description (optional)" value={description} onChangeText={setDescription} maxLength={1000} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title={saving ? 'Submitting...' : 'Submit Report'} onPress={submit} disabled={!reason || saving} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.sm },
  label: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  reason: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonOn: { borderColor: colors.primary },
  reasonText: { ...typography.body, color: colors.textPrimary },
  error: { ...typography.caption, color: colors.error },
});

export default ReportScreen;
