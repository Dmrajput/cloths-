import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader, EmptyState, ErrorState } from '../../components/common';
import RatingSummary from '../../components/reviews/RatingSummary';
import ReviewCard from '../../components/reviews/ReviewCard';
import { reviewService } from '../../services/reviewService';
import { REPORT_TARGETS } from '../../constants/safetyConstants';

const { colors, typography, spacing } = THEME;
const FILTERS = [
  { label: 'All', value: null },
  { label: '5★', value: 5 },
  { label: '4★', value: 4 },
  { label: '3★', value: 3 },
  { label: '2★', value: 2 },
  { label: '1★', value: 1 },
];

const ReviewsScreen = () => {
  const navigation = useNavigation();
  const listingId = useRoute().params?.listingId;
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [rating, setRating] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (nextPage, nextRating, replace) => {
    setLoading(replace);
    setError('');
    try {
      const [summaryResponse, listResponse] = await Promise.all([
        replace ? reviewService.getListingReviewSummary(listingId) : Promise.resolve(null),
        reviewService.getListingReviews(listingId, { page: nextPage, limit: 10, rating: nextRating, sort: 'newest' }),
      ]);
      if (summaryResponse) setSummary(summaryResponse.data);
      const nextItems = listResponse?.data?.items || [];
      setItems((current) => (replace ? nextItems : [...current, ...nextItems]));
      setPage(nextPage);
      setHasNextPage(Boolean(listResponse?.data?.pagination?.hasNextPage));
    } catch (loadError) {
      if (replace) setError(loadError.message || 'Could not load reviews.');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  const changeFilter = (value) => {
    setRating(value);
    load(1, value, true);
  };

  useEffect(() => {
    load(1, null, true);
  }, [load]);

  return (
    <ScreenContainer scroll={false} padded={false} edges={['top']}>
      <AppHeader title="Ratings & Reviews" showBack onBack={() => navigation.goBack()} />
      {loading && !items.length ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {!loading && error ? <ErrorState message={error} onActionPress={() => load(1, rating, true)} /> : null}
      {!error ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (hasNextPage && !loading) load(page + 1, rating, false);
          }}
          ListHeaderComponent={(
            <View>
              <RatingSummary summary={summary} />
              <View style={styles.filters}>
                {FILTERS.map((filter) => (
                  <Pressable
                    key={filter.label}
                    onPress={() => changeFilter(filter.value)}
                    accessibilityRole="button"
                    accessibilityLabel={filter.label}
                    accessibilityState={{ selected: rating === filter.value }}
                    style={[styles.filter, rating === filter.value && styles.filterOn]}
                  >
                    <Text style={styles.filterText}>{filter.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          ListEmptyComponent={!loading ? (
            <EmptyState icon="star-outline" title="No reviews yet" message="Be the first to share your rental experience." />
          ) : null}
          renderItem={({ item }) => (
            <ReviewCard
              review={item}
              onReport={() => navigation.navigate('Report', { targetType: REPORT_TARGETS.REVIEW, targetId: item.id })}
            />
          )}
        />
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  list: { padding: spacing.lg, paddingBottom: spacing.huge },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  filter: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  filterOn: { borderColor: colors.primary },
  filterText: { ...typography.caption, color: colors.textPrimary },
});

export default ReviewsScreen;
