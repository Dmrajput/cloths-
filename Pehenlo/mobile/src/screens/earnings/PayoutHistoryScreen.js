import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader, EmptyState, ErrorState } from '../../components/common';
import EarningStatusBadge from '../../components/earnings/EarningStatusBadge';
import { earningsService } from '../../services/earningsService';
import { rupees } from '../../utils/bookingHelpers';
import { earningErrorMessage } from '../../utils/earningHelpers';
import { formatEventTime } from '../../utils/rentalHelpers';

const { colors, typography, spacing, radius } = THEME;

const PayoutHistoryScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (mode = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const response = await earningsService.getPayouts({ page: 1, limit: 20 });
      setItems(response?.data?.payouts || []);
    } catch (loadError) {
      setError(earningErrorMessage(loadError, 'Unable to load payout history.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load('refresh');
  }, [load]));

  return (
    <ScreenContainer scroll={false} padded={false} edges={['top']}>
      <AppHeader title="Payout history" showBack onBack={() => navigation.goBack()} />
      {loading && !items.length ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {error ? <ErrorState title="Unable to load payouts" message={error} onActionPress={() => load()} /> : null}
      {!error ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={colors.primary} />}
          ListEmptyComponent={loading ? null : (
            <EmptyState icon="wallet-outline" title="No payouts yet" message="Requested payouts will appear here." />
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('PayoutDetails', { payoutId: item.id })}
              accessibilityRole="button"
              accessibilityLabel={`${item.payoutReference}, ${rupees(item.amount)}`}
              style={styles.card}
            >
              <Text style={styles.title}>{item.payoutReference}</Text>
              <Text style={styles.amount}>{rupees(item.amount)}</Text>
              <Text style={styles.meta}>Requested {formatEventTime(item.requestedAt)}</Text>
              {item.paidAt ? <Text style={styles.meta}>Paid {formatEventTime(item.paidAt)}</Text> : null}
              <EarningStatusBadge status={item.status} kind="payout" />
            </Pressable>
          )}
        />
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  list: { padding: spacing.lg, flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: { ...typography.label, color: colors.textPrimary },
  amount: { ...typography.h3, color: colors.primary, marginVertical: spacing.xs },
  meta: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs },
});

export default PayoutHistoryScreen;
