import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { bookingService } from '../../services/bookingService';
import BookingCard from '../../components/booking/BookingCard';
import { EmptyState, ErrorState } from '../../components/common';
import { bookingErrorMessage } from '../../utils/bookingErrors';

const { colors, typography, spacing } = THEME;

const OwnerBookingRequestsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await bookingService.getMyBookings({ role: 'owner', limit: 20 });
      setItems(response?.data?.items || []);
    } catch (loadError) {
      setError(bookingErrorMessage(loadError, 'Unable to load booking requests.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.header}>Booking requests</Text>
        <View style={styles.back} />
      </View>
      {error ? <ErrorState title="Unable to load requests" message={error} onActionPress={load} /> : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={styles.list}
          ListEmptyComponent={loading ? null : (
            <EmptyState icon="cube-outline" title="No booking requests" message="Requests for your outfits will appear here." />
          )}
          renderItem={({ item }) => (
            <BookingCard booking={item} onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })} />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { ...typography.h2, color: colors.textPrimary },
  header: { ...typography.h3, color: colors.textPrimary },
  list: { padding: spacing.lg, flexGrow: 1 },
});

export default OwnerBookingRequestsScreen;
