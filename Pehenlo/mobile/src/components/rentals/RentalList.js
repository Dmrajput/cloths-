import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { PAGE_SIZE } from '../../constants/rentalConstants';
import { rentalService } from '../../services/rentalService';
import { bookingErrorMessage } from '../../utils/bookingErrors';
import { EmptyState, ErrorState } from '../common';
import RentalCard from './RentalCard';

const { colors, spacing } = THEME;

function mergeBookings(current, incoming) {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => item.id && !seen.has(item.id))];
}

const RentalList = ({ role, group, empty, onOpen, renderFooter, listHeader }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async ({ nextPage = 1, mode = 'initial' } = {}) => {
    if (mode === 'more') setLoadingMore(true);
    else if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    if (mode !== 'more') setError('');
    try {
      const request = role === 'owner' ? rentalService.getMyOutfitRentals : rentalService.getMyRentals;
      const response = await request({ group, page: nextPage, limit: PAGE_SIZE });
      const batch = response?.data?.items || [];
      setItems((current) => (nextPage === 1 ? batch : mergeBookings(current, batch)));
      setPage(nextPage);
      setHasNext(Boolean(response?.data?.pagination?.hasNextPage));
    } catch (loadError) {
      if (nextPage === 1) setError(bookingErrorMessage(loadError, 'Unable to load your rentals. Please try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [group, role]);

  useEffect(() => {
    setItems([]);
    load({ nextPage: 1, mode: 'initial' });
  }, [load]);

  const refresh = () => load({ nextPage: 1, mode: 'refresh' });

  if (loading && !items.length) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }
  if (error && !items.length) {
    return <ErrorState title="Unable to load your rentals" message={error} onActionPress={() => load({ nextPage: 1 })} />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      style={styles.flex}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      ListHeaderComponent={listHeader || null}
      ListEmptyComponent={(
        <EmptyState
          icon="cube-outline"
          title={empty.title}
          message={empty.message}
          actionLabel={empty.action || undefined}
          onActionPress={empty.onAction}
        />
      )}
      ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={styles.more} /> : <View style={styles.more} />}
      onEndReached={() => {
        if (hasNext && !loadingMore && !refreshing) load({ nextPage: page + 1, mode: 'more' });
      }}
      onEndReachedThreshold={0.4}
      renderItem={({ item }) => (
        <RentalCard
          booking={item}
          onPress={() => onOpen(item)}
          footer={renderFooter ? renderFooter(item, refresh) : null}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.huge, flexGrow: 1 },
  loader: { marginTop: spacing.xl },
  more: { marginVertical: spacing.md },
});

export default RentalList;
