import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { EARNING_FILTERS, EARNING_PAGE_SIZE } from '../../constants/earningConstants';
import { ScreenContainer, AppHeader, EmptyState, ErrorState } from '../../components/common';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import EarningCard from '../../components/earnings/EarningCard';
import { earningsService } from '../../services/earningsService';
import { rupees } from '../../utils/bookingHelpers';
import { earningErrorMessage } from '../../utils/earningHelpers';

const { colors, typography, spacing, radius } = THEME;

function merge(current, incoming) {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => item.id && !seen.has(item.id))];
}

const MyEarningsScreen = () => {
  const navigation = useNavigation();
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async ({ nextPage = 1, mode = 'initial', status = filter } = {}) => {
    if (mode === 'more') setLoadingMore(true);
    else if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    if (mode !== 'more') setError('');
    try {
      const [summaryResponse, listResponse] = await Promise.all([
        nextPage === 1 ? earningsService.getSummary() : Promise.resolve(null),
        earningsService.getEarnings({ page: nextPage, limit: EARNING_PAGE_SIZE, status }),
      ]);
      if (summaryResponse) setSummary(summaryResponse.data);
      const batch = listResponse?.data?.earnings || [];
      setItems((current) => (nextPage === 1 ? batch : merge(current, batch)));
      setPage(nextPage);
      setHasNext(Boolean(listResponse?.data?.pagination?.hasNextPage));
    } catch (loadError) {
      if (nextPage === 1) setError(earningErrorMessage(loadError, 'Unable to load your earnings. Please try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => {
    load({ nextPage: 1, mode: 'refresh' });
  }, [load]));

  const changeFilter = (status) => {
    setFilter(status);
    setItems([]);
    load({ nextPage: 1, mode: 'initial', status });
  };

  const header = (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Total earned</Text>
        <Text style={styles.heroValue}>{rupees(summary?.totalNet)}</Text>
      </View>
      <View style={styles.grid}>
        <View style={styles.tile}>
          <Text style={styles.tileLabel}>Available</Text>
          <Text style={styles.tileValue}>{rupees(summary?.availableAmount)}</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileLabel}>Pending</Text>
          <Text style={styles.tileValue}>{rupees(summary?.pendingAmount)}</Text>
        </View>
      </View>
      <View style={styles.paid}>
        <Text style={styles.tileLabel}>Paid</Text>
        <Text style={styles.tileValue}>{rupees(summary?.paidAmount)}</Text>
      </View>
      <View style={styles.withdraw}>
        <Text style={styles.tileLabel}>Available to withdraw</Text>
        <Text style={styles.withdrawValue}>{rupees(summary?.availableAmount)}</Text>
        <PrimaryButton title="Withdraw" onPress={() => navigation.navigate('Withdraw')} accessibilityLabel="Withdraw earnings" />
      </View>
      <View style={styles.filters}>
        {EARNING_FILTERS.map((item) => {
          const selected = item.id === filter;
          return (
            <Pressable
              key={item.id}
              onPress={() => changeFilter(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.filter, selected && styles.filterOn]}
            >
              <Text style={[styles.filterText, selected && styles.filterTextOn]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.sectionRow}>
        <Text style={styles.section}>Recent earnings</Text>
        <Pressable onPress={() => navigation.navigate('PayoutHistory')} accessibilityRole="button" accessibilityLabel="Payout history">
          <Text style={styles.history}>Payout history</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer scroll={false} padded={false} edges={['top']}>
      <AppHeader title="My Earnings" showBack onBack={() => navigation.goBack()} />
      {loading && !items.length && !summary ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {error && !summary ? <ErrorState title="Unable to load earnings" message={error} onActionPress={() => load({ nextPage: 1 })} /> : null}
      {(summary || items.length || !loading) && !error ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ nextPage: 1, mode: 'refresh' })} tintColor={colors.primary} />}
          ListHeaderComponent={header}
          ListEmptyComponent={loading ? null : (
            <EmptyState
              icon="shirt-outline"
              title="No earnings yet"
              message="List your traditional outfits and start earning from rentals."
              actionLabel="List an Outfit"
              onActionPress={() => navigation.navigate('MainTabs', { screen: 'ListOutfit' })}
            />
          )}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} /> : null}
          onEndReached={() => {
            if (hasNext && !loadingMore && !refreshing) load({ nextPage: page + 1, mode: 'more' });
          }}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <EarningCard earning={item} onPress={() => navigation.navigate('EarningDetails', { earningId: item.id })} />
          )}
        />
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  list: { padding: spacing.lg, paddingBottom: spacing.huge, flexGrow: 1 },
  hero: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  heroLabel: { ...typography.body, color: colors.textLight },
  heroValue: { ...typography.h1, color: colors.textLight, marginTop: spacing.xs },
  grid: { flexDirection: 'row', gap: spacing.sm },
  tile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  tileLabel: { ...typography.caption, color: colors.textSecondary },
  tileValue: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.xs },
  paid: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  withdraw: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  withdrawValue: { ...typography.h2, color: colors.primary, marginVertical: spacing.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  filter: { minHeight: 40, paddingHorizontal: spacing.md, borderRadius: radius.round, backgroundColor: colors.surface, justifyContent: 'center' },
  filterOn: { backgroundColor: colors.primary },
  filterText: { ...typography.label, color: colors.textSecondary },
  filterTextOn: { color: colors.textLight },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  section: { ...typography.h3, color: colors.textPrimary },
  history: { ...typography.label, color: colors.primary },
});

export default MyEarningsScreen;
