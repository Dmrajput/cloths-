import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader, EmptyState, ErrorState } from '../../components/common';
import { listingService } from '../../services/listingService';
import { formatINR } from '../../utils/paymentHelpers';

const { colors, typography, spacing, radius } = THEME;

const MyListingsScreen = () => {
  const navigation = useNavigation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await listingService.getMyListings();
      setListings(response?.data?.listings || []);
    } catch (loadError) {
      setError(loadError.message || 'Could not load your listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  return (
    <ScreenContainer scroll={false} padded={false} edges={['top']}>
      <AppHeader title="My Listings" showBack onBack={() => navigation.goBack()} />
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {!loading && error ? <ErrorState message={error} actionLabel="Try Again" onActionPress={load} /> : null}
      {!loading && !error ? (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={(
            <EmptyState
              icon="shirt-outline"
              title="No listings yet"
              message="List an outfit to start earning from rentals."
              actionLabel="List an Outfit"
              onActionPress={() => navigation.navigate('MainTabs', { screen: 'ListOutfit' })}
            />
          )}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.coverImage ? <Image source={{ uri: item.coverImage }} style={styles.image} /> : <View style={styles.image} />}
              <View style={styles.copy}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.meta}>{item.price != null ? `${formatINR(item.price)} / rental` : ''}</Text>
                <Text style={styles.status}>{item.status || 'DRAFT'}</Text>
              </View>
            </View>
          )}
        />
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  list: { padding: spacing.lg, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: { width: 84, height: 84, backgroundColor: colors.background },
  copy: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  title: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  status: { ...typography.caption, color: colors.primary, marginTop: 4 },
});

export default MyListingsScreen;
