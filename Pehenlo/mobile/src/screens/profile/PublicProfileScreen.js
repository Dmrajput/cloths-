import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader, ErrorState } from '../../components/common';
import { safetyService } from '../../services/safetyService';
import { REPORT_TARGETS } from '../../constants/safetyConstants';

const { colors, typography, spacing, radius } = THEME;

function sinceLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

const PublicProfileScreen = () => {
  const navigation = useNavigation();
  const userId = useRoute().params?.userId;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await safetyService.getPublicUserProfile(userId);
      setProfile(response?.data?.profile || null);
    } catch (loadError) {
      setError(loadError.message || 'Could not load this profile.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const block = () => {
    Alert.alert('Block user?', 'Their listings will be hidden from your Home and Explore. Existing bookings stay unchanged.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block user',
        style: 'destructive',
        onPress: async () => {
          try {
            await safetyService.blockUser(userId);
            navigation.goBack();
          } catch (blockError) {
            Alert.alert('Could not block user', blockError.message || 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="Profile" showBack onBack={() => navigation.goBack()} />
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {!loading && error ? <ErrorState message={error} onActionPress={load} /> : null}
      {!loading && profile ? (
        <View style={styles.body}>
          {profile.profileImage ? <Image source={{ uri: profile.profileImage }} style={styles.photo} accessibilityLabel="Profile photo" /> : <View style={styles.photo} />}
          <Text style={styles.name}>{profile.name}</Text>
          {profile.city ? <Text style={styles.meta}>{profile.city}</Text> : null}
          {sinceLabel(profile.memberSince) ? <Text style={styles.meta}>Member since {sinceLabel(profile.memberSince)}</Text> : null}
          <Text style={styles.meta}>Owner rating {profile.reviewCount ? `${Number(profile.ownerRating).toFixed(1)} ★ · ${profile.reviewCount} reviews` : 'No owner reviews yet'}</Text>
          <Text style={styles.meta}>Completed rentals {profile.completedRentalCount}</Text>
          <Text style={styles.section}>Active listings</Text>
          {profile.listings?.length ? profile.listings.map((listing) => (
            <Pressable key={listing.id} onPress={() => navigation.navigate('OutfitDetails', { listingId: listing.id })} accessibilityRole="button" accessibilityLabel={listing.title} style={styles.listing}>
              <Text style={styles.listingTitle}>{listing.title}</Text>
              <Text style={styles.meta}>{listing.city}</Text>
            </Pressable>
          )) : <Text style={styles.meta}>No active listings</Text>}
          <Pressable onPress={() => navigation.navigate('Report', { targetType: REPORT_TARGETS.USER, targetId: userId })} accessibilityRole="button" accessibilityLabel="Report user" style={styles.action}>
            <Text style={styles.actionText}>Report user</Text>
          </Pressable>
          <Pressable onPress={block} accessibilityRole="button" accessibilityLabel="Block user" style={styles.action}>
            <Text style={styles.danger}>Block user</Text>
          </Pressable>
        </View>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  body: { padding: spacing.lg, alignItems: 'center' },
  photo: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.surface, marginBottom: spacing.sm },
  name: { ...typography.h2, color: colors.textPrimary },
  meta: { ...typography.body, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  section: { ...typography.h3, color: colors.textPrimary, alignSelf: 'flex-start', marginTop: spacing.lg, marginBottom: spacing.sm },
  listing: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  listingTitle: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  action: { minHeight: 44, justifyContent: 'center', alignSelf: 'stretch' },
  actionText: { ...typography.body, color: colors.primary, textAlign: 'center' },
  danger: { ...typography.body, color: colors.error, textAlign: 'center', fontWeight: '600' },
});

export default PublicProfileScreen;
