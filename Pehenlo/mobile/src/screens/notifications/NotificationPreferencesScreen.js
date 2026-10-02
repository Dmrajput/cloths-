import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader, ErrorState } from '../../components/common';
import { PREFERENCE_ROWS } from '../../constants/notificationConstants';
import { notificationApi } from '../../services/notificationService';

const { colors, typography, spacing, radius } = THEME;

const NotificationPreferencesScreen = () => {
  const navigation = useNavigation();
  const [preferences, setPreferences] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await notificationApi.getNotificationPreferences();
      setPreferences(response?.data?.preferences || null);
    } catch (loadError) {
      setError(loadError.message || 'Could not load preferences.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const toggle = async (key, value) => {
    const previous = preferences;
    setPreferences({ ...preferences, [key]: value });
    try {
      const response = await notificationApi.updateNotificationPreferences({ [key]: value });
      setPreferences(response?.data?.preferences || { ...preferences, [key]: value });
    } catch (saveError) {
      setPreferences(previous);
      setError(saveError.message || 'Could not save this preference.');
    }
  };

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="Notification preferences" showBack onBack={() => navigation.goBack()} />
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {!loading && error && !preferences ? <ErrorState message={error} onActionPress={load} /> : null}
      {preferences ? (
        <View style={styles.body}>
          <Text style={styles.note}>
            These settings control phone alerts. Notifications still stay in your notification list.
          </Text>
          {PREFERENCE_ROWS.map((row) => (
            <View key={row.key} style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.label}>{row.label}</Text>
                {row.hint ? <Text style={styles.hint}>{row.hint}</Text> : null}
              </View>
              <Switch
                value={Boolean(preferences[row.key])}
                onValueChange={(value) => toggle(row.key, value)}
                trackColor={{ true: colors.primary, false: colors.border }}
                accessibilityLabel={row.label}
              />
            </View>
          ))}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  body: { padding: spacing.lg, gap: spacing.sm },
  note: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  row: {
    minHeight: 64,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: { flex: 1 },
  label: { ...typography.body, color: colors.textPrimary },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  error: { ...typography.caption, color: colors.error },
});

export default NotificationPreferencesScreen;
