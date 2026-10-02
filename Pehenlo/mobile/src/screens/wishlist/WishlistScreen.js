import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader, EmptyState, ErrorState } from '../../components/common';
import OutfitCard from '../../components/cards/OutfitCard';
import { wishlistService } from '../../services/wishlistService';
import { useWishlist } from '../../context/WishlistContext';

const { colors, spacing } = THEME;

const WishlistScreen = () => {
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite, refreshWishlist } = useWishlist();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (nextPage, replace) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      const response = await wishlistService.getWishlist({ page: nextPage, limit: 10 });
      const nextItems = response?.data?.items || [];
      setItems((current) => (replace ? nextItems : [...current, ...nextItems]));
      setPage(nextPage);
      setHasNextPage(Boolean(response?.data?.pagination?.hasNextPage));
    } catch (loadError) {
      if (replace) {
        setItems([]);
        setError(loadError.message || "Couldn't load your Wishlist.");
      } else {
        Alert.alert('Unable to update Wishlist.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load(1, true);
    refreshWishlist();
  }, [load, refreshWishlist]));

  const onFavorite = async (listingId) => {
    const result = await toggleFavorite(listingId);
    if (!result.ok && !result.pending) {
      Alert.alert(result.needsLogin ? 'Sign in to save outfits to your Wishlist.' : 'Unable to update Wishlist.');
      return;
    }
    if (result.ok && result.isFavorite === false) {
      setItems((current) => current.filter((item) => item.listing?.id !== listingId));
    }
  };

  return (
    <ScreenContainer scroll={false} padded={false} edges={['top']}>
      <AppHeader title="Wishlist" subtitle="Outfits you've saved for later" showBack onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : null}
      {!loading && error ? (
        <ErrorState message={error} actionLabel="Try Again" onActionPress={() => load(1, true)} />
      ) : null}
      {!loading && !error ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={items.length ? styles.row : undefined}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (hasNextPage && !loadingMore) load(page + 1, false);
          }}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} /> : null}
          ListEmptyComponent={(
            <EmptyState
              icon="heart-outline"
              title="No saved outfits yet"
              message="Save outfits you love and find them here later."
              actionLabel="Explore Outfits"
              onActionPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
            />
          )}
          renderItem={({ item }) => {
            const listing = item.listing || {};
            const available = listing.available !== false && listing.id;
            return (
              <OutfitCard
                image={listing.coverImage}
                title={listing.title}
                price={available ? listing.rentalPrice : null}
                duration={available ? listing.rentalDuration : null}
                rating={available ? listing.rating : null}
                location={available ? listing.city : 'Currently unavailable'}
                isFavorite={listing.id ? isFavorite(listing.id) : true}
                onPress={() => {
                  if (listing.id) navigation.navigate('OutfitDetails', { listingId: listing.id });
                }}
                onFavoritePress={() => {
                  if (listing.id) onFavorite(listing.id);
                }}
                style={styles.card}
              />
            );
          }}
        />
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.huge },
  row: { gap: spacing.sm },
  card: { flex: 1, marginBottom: spacing.sm },
});

export default WishlistScreen;
