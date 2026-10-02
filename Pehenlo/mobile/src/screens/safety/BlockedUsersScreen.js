import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader, EmptyState, ErrorState } from '../../components/common';
import { safetyService } from '../../services/safetyService';

const { colors, typography, spacing, radius } = THEME;

const BlockedUsersScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await safetyService.getBlockedUsers();
      setUsers(response?.data?.users || []);
    } catch (loadError) {
      setError(loadError.message || 'Could not load blocked users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const unblock = (user) => {
    Alert.alert('Unblock user?', `${user.name} can appear in Explore again.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        onPress: async () => {
          try {
            await safetyService.unblockUser(user.id);
            setUsers((current) => current.filter((item) => item.id !== user.id));
          } catch (unblockError) {
            Alert.alert('Could not unblock', unblockError.message || 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer scroll={false} padded={false} edges={['top']}>
      <AppHeader title="Blocked users" showBack onBack={() => navigation.goBack()} />
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {!loading && error ? <ErrorState message={error} onActionPress={load} /> : null}
      {!loading && !error ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="person-outline" title="No blocked users" message="People you block will appear here." />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Pressable onPress={() => unblock(item)} accessibilityRole="button" accessibilityLabel={`Unblock ${item.name}`} style={styles.button}>
                <Text style={styles.buttonText}>Unblock</Text>
              </Pressable>
            </View>
          )}
        />
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  list: { padding: spacing.lg },
  row: {
    minHeight: 64,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { ...typography.body, color: colors.textPrimary, flex: 1 },
  button: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  buttonText: { ...typography.body, color: colors.primary, fontWeight: '600' },
});

export default BlockedUsersScreen;
