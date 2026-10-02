import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { HOME_HERO, OCCASIONS, WEDDING_COLLECTION } from '../../constants/occasions';
import { ScreenContainer, AppHeader, ErrorState } from '../../components/common';
import { TextButton } from '../../components/buttons';
import { listingService } from '../../services/listingService';
import { useAuth } from '../../hooks/useAuth';
import { getAuthErrorMessage } from '../../utils/validation';
import HeroBanner from '../../components/home/HeroBanner';
import CategoryList from '../../components/home/CategoryList';
import OccasionCard from '../../components/home/OccasionCard';
import SectionHeader from '../../components/home/SectionHeader';
import HorizontalListingSection from '../../components/home/HorizontalListingSection';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';

const { colors, typography, spacing, radius } = THEME;

const initialSection = { loading: true, error: '', items: [] };

function firstName(name) {
  const value = String(name || '').trim().split(/\s+/)[0];
  return value || '';
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const city = user?.city?.trim() || '';
  const [categories, setCategories] = useState(initialSection);
  const [featured, setFeatured] = useState(initialSection);
  const [trending, setTrending] = useState(initialSection);
  const [nearby, setNearby] = useState(initialSection);
  const [recent, setRecent] = useState(initialSection);
  const [refreshing, setRefreshing] = useState(false);
  const { isFavorite, toggleFavorite } = useWishlist();
  const { unreadCount } = useNotifications();

  const loadSection = useCallback(async (setter, request) => {
    setter((current) => ({ ...current, loading: current.items.length === 0, error: '' }));
    try {
      const response = await request();
      const items = response?.data?.categories || response?.data?.listings || [];
      setter({ loading: false, error: '', items });
    } catch (error) {
      setter((current) => ({
        ...current,
        loading: false,
        error: getAuthErrorMessage(error).includes('connect')
          ? 'Couldn’t load this section. Check your connection.'
          : 'Couldn’t load this section.',
      }));
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadSection(setCategories, () => listingService.getCategories()),
      loadSection(setFeatured, () => listingService.getFeaturedListings()),
      loadSection(setTrending, () => listingService.getTrendingListings()),
      city
        ? loadSection(setNearby, () => listingService.getNearbyListings({ city }))
        : Promise.resolve(setNearby({ loading: false, error: '', items: [] })),
      loadSection(setRecent, () => listingService.getRecentListings()),
    ]);
  }, [city, loadSection]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  }, [loadAll, refreshing]);

  const openExplore = (params = {}) => navigation.navigate('Explore', {
    navToken: Date.now(),
    focusSearch: Boolean(params.focusSearch),
    category: params.category || null,
    categoryName: params.categoryName || null,
    occasion: params.occasion || null,
    source: params.source || null,
    city: params.city || null,
    sort: params.sort || null,
  }, { merge: false });
  const openListing = (listing) => navigation.navigate('OutfitDetails', { listingId: listing.id });
  const onFavoritePress = async (id) => {
    const result = await toggleFavorite(id);
    if (result?.needsLogin) {
      Alert.alert('Sign in to save outfits to your Wishlist.');
    } else if (result && !result.ok && !result.pending) {
      Alert.alert('Unable to update Wishlist.');
    }
  };

  const sections = [
    categories,
    featured,
    trending,
    nearby,
    recent,
  ];
  const allFailed = sections.every((section) => section.error) && sections.every((section) => !section.loading);
  const anyLoading = sections.some((section) => section.loading);

  const listingProps = {
    onPressListing: openListing,
    onFavoritePress,
    isFavorite,
  };

  const header = (
    <View>
      <Text style={styles.greeting}>
        {firstName(user?.name) ? `Hi, ${firstName(user?.name)}` : 'Hi there'} 👋
      </Text>
      <Text style={styles.subheading}>Find something beautiful{'\n'}for your next occasion.</Text>
      <Pressable
        onPress={() => openExplore({ focusSearch: true })}
        accessibilityRole="button"
        accessibilityLabel="Search outfits"
        style={styles.search}
      >
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <Text style={styles.searchText}>Search lehenga, saree...</Text>
      </Pressable>

      {categories.loading ? (
        <View style={styles.categorySkeletonRow}>
          {[0, 1, 2, 3].map((item) => <View key={item} style={styles.categorySkeleton} />)}
        </View>
      ) : null}
      {!categories.loading && categories.error ? (
        <View style={styles.inlineError}>
          <Text style={styles.inlineErrorText}>{categories.error}</Text>
          <TextButton
            title="Retry"
            onPress={() => loadSection(setCategories, () => listingService.getCategories())}
            accessibilityLabel="Retry categories"
          />
        </View>
      ) : null}
      {!categories.loading && !categories.error ? (
        <CategoryList
          categories={categories.items}
          onPressCategory={(category) => openExplore({
            category: category.slug,
            categoryName: category.name,
          })}
          onSeeAll={() => openExplore({ source: 'categories' })}
        />
      ) : null}

      <HeroBanner
        title={HOME_HERO.title}
        subtitle={HOME_HERO.subtitle}
        buttonText={HOME_HERO.buttonText}
        onPress={() => openExplore({ occasion: HOME_HERO.id })}
      />

      <HorizontalListingSection
        title="Featured"
        listings={featured.items}
        loading={featured.loading}
        error={featured.error}
        emptyTitle="Featured outfits"
        emptyMessage="New styles are coming soon. Explore all available outfits."
        onRetry={() => loadSection(setFeatured, () => listingService.getFeaturedListings())}
        onSeeAll={() => openExplore({ source: 'featured' })}
        {...listingProps}
      />
      <HorizontalListingSection
        title="Trending Near You"
        listings={trending.items}
        loading={trending.loading}
        error={trending.error}
        emptyTitle="Trending outfits"
        emptyMessage="New styles are coming soon. Explore all available outfits."
        onRetry={() => loadSection(setTrending, () => listingService.getTrendingListings())}
        onSeeAll={() => openExplore({ source: 'trending' })}
        {...listingProps}
      />

      <OccasionCard
        variant="banner"
        title={WEDDING_COLLECTION.title}
        subtitle={WEDDING_COLLECTION.subtitle}
        onPress={() => openExplore({ occasion: WEDDING_COLLECTION.id })}
      />

      <HorizontalListingSection
        title="Available Near You"
        listings={nearby.items}
        loading={nearby.loading}
        error={nearby.error}
        emptyTitle={city ? 'No outfits available nearby yet.' : 'Select a city'}
        emptyMessage={city
          ? 'Try exploring other collections.'
          : 'Add your city in profile to see outfits near you.'}
        onRetry={city ? () => loadSection(setNearby, () => listingService.getNearbyListings({ city })) : undefined}
        onSeeAll={() => openExplore({ source: 'nearby', city })}
        {...listingProps}
      />

      <SectionHeader title="Shop by Occasion" />
      <FlatList
        horizontal
        data={OCCASIONS}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.occasionList}
        renderItem={({ item }) => (
          <OccasionCard
            title={item.name}
            onPress={() => openExplore({ occasion: item.id })}
          />
        )}
      />
    </View>
  );

  if (allFailed && !anyLoading && !refreshing) {
    return (
      <ScreenContainer padded={false} edges={['top']}>
        <AppHeader
          location={city || 'Select Location'}
          showNotification
          notificationCount={unreadCount}
          onNotificationPress={() => navigation.navigate('Notifications')}
        />
        <ErrorState
          title="Unable to load Pehenlo"
          message="Please check your connection and try again."
          actionLabel="Retry"
          onActionPress={loadAll}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded={false} edges={['top']}>
      <AppHeader
        location={city || 'Select Location'}
        showNotification
        notificationCount={unreadCount}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />
      <FlatList
        data={[{ id: 'recent' }]}
        keyExtractor={(item) => item.id}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        )}
        ListHeaderComponent={header}
        renderItem={() => (
          <HorizontalListingSection
            title="Recently Added"
            listings={recent.items}
            loading={recent.loading}
            error={recent.error}
            emptyTitle="Recently added"
            emptyMessage="New styles are coming soon. Explore all available outfits."
            onRetry={() => loadSection(setRecent, () => listingService.getRecentListings())}
            onSeeAll={() => openExplore({ source: 'recent' })}
            {...listingProps}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  greeting: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subheading: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    marginBottom: spacing.xl,
  },
  searchText: {
    ...typography.body,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  categorySkeletonRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  categorySkeleton: {
    width: 72,
    height: 72,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceSecondary,
    marginRight: spacing.sm,
  },
  inlineError: {
    marginBottom: spacing.lg,
  },
  inlineErrorText: {
    ...typography.body,
    color: colors.error,
  },
  occasionList: {
    marginBottom: spacing.xl,
  },
});

export default HomeScreen;
