import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { EXPLORE_PAGE_SIZE, emptyFilters, sortLabel } from '../../constants/exploreConstants';
import { ScreenContainer, EmptyState, ErrorState } from '../../components/common';
import { OutfitCard } from '../../components/cards';
import SearchBar from '../../components/search/SearchBar';
import { listingService } from '../../services/listingService';
import {
  buildListingQueryParams,
  cloneFilters,
  countActiveFilterGroups,
} from '../../utils/listingQuery';
import ActiveFilterChips from './components/ActiveFilterChips';
import SortBottomSheet from './components/SortBottomSheet';

const { colors, typography, spacing, radius } = THEME;

function fromNavigation(params = {}) {
  const useAppliedFilters = params.filterToken
    && (!params.navToken || params.filterToken > params.navToken);

  if (useAppliedFilters) {
    return {
      filters: cloneFilters(params.filters),
      sort: params.sort || 'recommended',
      search: params.search || '',
      focusSearch: false,
    };
  }

  const filters = emptyFilters();
  if (params.category) filters.category = [params.category];
  if (params.city) filters.city = params.city;
  if (params.occasion) filters.occasion = params.occasion;
  if (params.source === 'featured') filters.source = 'featured';
  if (params.source === 'nearby' && params.city) filters.city = params.city;

  let sort = 'recommended';
  if (params.source === 'trending') sort = 'views_desc';
  if (params.source === 'recent') sort = 'newest';
  if (params.sort) sort = params.sort;

  return {
    filters,
    sort,
    search: '',
    focusSearch: Boolean(params.focusSearch),
  };
}

const ExploreScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const searchRef = useRef(null);
  const requestRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const appliedToken = useRef(route.params?.navToken || route.params?.filterToken || null);
  const initial = fromNavigation(route.params || {});

  const [searchInput, setSearchInput] = useState(initial.search);
  const [search, setSearch] = useState(initial.search);
  const [filters, setFilters] = useState(initial.filters);
  const [sort, setSort] = useState(initial.sort);
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, hasNextPage: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [categories, setCategories] = useState([]);

  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;
  const filterCount = countActiveFilterGroups(filters);
  const queryKey = useMemo(
    () => JSON.stringify({ search, filters, sort }),
    [search, filters, sort]
  );

  useEffect(() => {
    listingService.getCategories()
      .then((response) => setCategories(response?.data?.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const token = route.params?.navToken || route.params?.filterToken;
    if (!token || token === appliedToken.current) return;
    appliedToken.current = token;
    const next = fromNavigation(route.params);
    setSearchInput(next.search);
    setSearch(next.search);
    setFilters(next.filters);
    setSort(next.sort);
    if (next.focusSearch) {
      setTimeout(() => searchRef.current?.focus(), 250);
    }
  }, [route.params]);

  useEffect(() => {
    if (!initial.focusSearch) return undefined;
    const timer = setTimeout(() => searchRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [initial.focusSearch]);

  const loadPage = useCallback(async (nextPage, mode) => {
    const requestId = mode === 'append' ? requestRef.current : requestRef.current + 1;
    if (mode !== 'append') requestRef.current = requestId;

    if (mode === 'refresh') setIsRefreshing(true);
    else if (mode === 'append') {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setIsLoadingMore(true);
      setPageError(null);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await listingService.getListings(buildListingQueryParams({
        page: nextPage,
        limit: EXPLORE_PAGE_SIZE,
        search,
        sort,
        filters,
      }));
      if (requestRef.current !== requestId) return;
      const items = response?.data?.items || [];
      const nextPagination = response?.data?.pagination || {
        total: items.length,
        totalPages: 1,
        hasNextPage: false,
      };
      setPagination(nextPagination);
      setPage(nextPagination.page || nextPage);
      setListings((current) => {
        if (mode === 'append') {
          const seen = new Set(current.map((item) => item.id));
          return [...current, ...items.filter((item) => !seen.has(item.id))];
        }
        return items;
      });
      if (mode !== 'append') setError(null);
    } catch (loadError) {
      if (requestRef.current !== requestId) return;
      if (mode === 'append') setPageError(loadError);
      else if (mode === 'refresh') setError(loadError);
      else {
        setListings([]);
        setError(loadError);
      }
    } finally {
      if (requestRef.current !== requestId && mode !== 'refresh') {
        if (mode === 'append') {
          loadingMoreRef.current = false;
          setIsLoadingMore(false);
        }
        return;
      }
      if (mode === 'refresh') setIsRefreshing(false);
      else if (mode === 'append') {
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [filters, search, sort]);

  useEffect(() => {
    loadPage(1, 'replace');
  }, [queryKey, loadPage]);

  const categoryName = (slug) => categories.find((category) => category.slug === slug)?.name || slug;

  const submitSearch = () => setSearch(searchInput.trim());

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  const clearAll = () => {
    setSearchInput('');
    setSearch('');
    setFilters(emptyFilters());
    setSort('recommended');
  };

  const openFilters = () => {
    navigation.navigate('Filter', {
      filters,
      sort,
      search,
    });
  };

  const resultLabel = pagination.total == null
    ? 'Outfits'
    : `${pagination.total} outfit${pagination.total === 1 ? '' : 's'} found`;

  const listHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>Explore</Text>
      <SearchBar
        ref={searchRef}
        value={searchInput}
        onChangeText={setSearchInput}
        onSubmit={submitSearch}
        onClear={clearSearch}
      />
      <View style={styles.actions}>
        <Pressable
          onPress={openFilters}
          accessibilityRole="button"
          accessibilityLabel={filterCount ? `Filters, ${filterCount} active` : 'Filters'}
          style={styles.actionButton}
        >
          <Ionicons name="options-outline" size={18} color={colors.primary} />
          <Text style={styles.actionText}>{filterCount ? `Filters (${filterCount})` : 'Filters'}</Text>
        </Pressable>
        <Pressable
          onPress={() => setSortOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Sort, ${sortLabel(sort)}`}
          style={styles.actionButton}
        >
          <Ionicons name="swap-vertical" size={18} color={colors.primary} />
          <Text style={styles.actionText}>{sortLabel(sort)}</Text>
        </Pressable>
      </View>
      <ActiveFilterChips
        filters={filters}
        categoryName={categoryName}
        onRemoveCategory={(slug) => setFilters((current) => ({
          ...current,
          category: current.category.filter((item) => item !== slug),
        }))}
        onRemoveGender={() => setFilters((current) => ({ ...current, gender: null }))}
        onRemovePrice={() => setFilters((current) => ({ ...current, minPrice: null, maxPrice: null }))}
        onRemoveSize={(size) => setFilters((current) => ({
          ...current,
          size: current.size.filter((item) => item !== size),
        }))}
        onRemoveCondition={(condition) => setFilters((current) => ({
          ...current,
          condition: current.condition.filter((item) => item !== condition),
        }))}
        onRemoveRating={() => setFilters((current) => ({ ...current, minRating: null }))}
        onRemoveCity={() => setFilters((current) => ({ ...current, city: null }))}
        onRemoveOccasion={() => setFilters((current) => ({ ...current, occasion: null }))}
        onRemoveSource={() => setFilters((current) => ({ ...current, source: null }))}
        onClearAll={clearAll}
      />
      <Text style={styles.count}>{resultLabel}</Text>
      {error && listings.length ? (
        <ErrorState
          title="Something went wrong"
          message="We couldn't load outfits right now."
          actionLabel="Try Again"
          onActionPress={() => loadPage(1, 'replace')}
          style={styles.inlineError}
        />
      ) : null}
    </View>
  );

  const listEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonGrid}>
          {[0, 1, 2, 3].map((item) => (
            <View key={item} style={[styles.skeleton, { width: cardWidth }]} />
          ))}
        </View>
      );
    }
    if (error) {
      return (
        <ErrorState
          title="Something went wrong"
          message="We couldn't load outfits right now."
          actionLabel="Try Again"
          onActionPress={() => loadPage(1, 'replace')}
        />
      );
    }
    return (
      <EmptyState
        icon="search-outline"
        title={search ? `No results for "${search}"` : 'No outfits found'}
        message="Try changing your filters or searching for something else."
        actionLabel={search && !filterCount ? 'Clear Search' : 'Clear Filters'}
        onActionPress={search && !filterCount ? clearSearch : clearAll}
      />
    );
  };

  return (
    <ScreenContainer padded={false} edges={['top']}>
      <FlatList
        data={isLoading && listings.length === 0 ? [] : listings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={listings.length ? styles.row : undefined}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        renderItem={({ item }) => (
          <OutfitCard
            image={item.coverImage}
            title={item.title}
            price={item.price}
            duration={item.rentalDuration}
            rating={item.rating}
            location={item.city}
            isFavorite={Boolean(favorites[item.id])}
            onPress={() => navigation.navigate('OutfitDetails', { listingId: item.id })}
            onFavoritePress={() => setFavorites((current) => ({
              ...current,
              [item.id]: !current[item.id],
            }))}
            style={{ width: cardWidth }}
          />
        )}
        refreshControl={(
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadPage(1, 'refresh')}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        )}
        onEndReached={() => {
          if (!pagination.hasNextPage || isLoading || isRefreshing || isLoadingMore || error) return;
          loadPage(page + 1, 'append');
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={isLoadingMore ? (
          <ActivityIndicator color={colors.primary} style={styles.footer} />
        ) : pageError ? (
          <Pressable
            onPress={() => loadPage(page + 1, 'append')}
            accessibilityRole="button"
            accessibilityLabel="Try loading more outfits"
            style={styles.footer}
          >
            <Text style={styles.pageError}>Couldn't load more outfits</Text>
            <Text style={styles.retry}>Try Again</Text>
          </Pressable>
        ) : <View style={styles.footerSpace} />}
      />
      <SortBottomSheet
        visible={sortOpen}
        value={sort}
        onClose={() => setSortOpen(false)}
        onSelect={(value) => {
          setSortOpen(false);
          setSort(value);
        }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  actionButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    ...typography.label,
    color: colors.primary,
  },
  count: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeleton: {
    height: 240,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    marginBottom: spacing.md,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerSpace: {
    height: spacing.lg,
  },
  pageError: {
    ...typography.body,
    color: colors.textSecondary,
  },
  retry: {
    ...typography.label,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  inlineError: {
    marginTop: spacing.md,
  },
});

export default ExploreScreen;
