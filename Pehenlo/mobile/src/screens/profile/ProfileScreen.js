import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';
import { badgeLabel } from '../../utils/notificationHelpers';
import { userService } from '../../services/userService';

const { colors, typography, spacing, radius } = THEME;

function photoUri(user) {
  if (!user?.profileImage) return '';
  const version = user.updatedAt ? new Date(user.updatedAt).getTime() : '';
  if (!version) return user.profileImage;
  const joiner = user.profileImage.includes('?') ? '&' : '?';
  return `${user.profileImage}${joiner}v=${version}`;
}

function locationLabel(user) {
  return [user?.city, user?.state].map((part) => String(part || '').trim()).filter(Boolean).join(', ');
}

function MenuRow({ icon, label, detail, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={detail ? `${label}, ${detail}` : label} style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.rowLabel}>{label}</Text>
      {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { count } = useWishlist();
  const { unreadCount } = useNotifications();
  const [summary, setSummary] = useState(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    userService.getSummary()
      .then((response) => {
        if (active) setSummary(response?.data || null);
      })
      .catch(() => {
        if (active) setSummary(null);
      });
    return () => {
      active = false;
    };
  }, [user?.updatedAt, user?.name]));

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will need to sign in again to see your profile and wishlist.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const place = locationLabel(user);
  const stats = [
    { label: 'Outfits Listed', value: summary?.listingCount },
    { label: 'Rentals', value: summary?.rentalCount },
    { label: 'Saved', value: summary?.wishlistCount ?? count },
  ];

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="Profile" />
      <View style={styles.header}>
        {photoUri(user) ? (
          <Image source={{ uri: photoUri(user) }} style={styles.photo} accessibilityLabel="Profile photo" />
        ) : (
          <View style={styles.photo} accessibilityLabel="Profile photo">
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
        )}
        <Text style={styles.name}>{user?.name || 'Pehenlo member'}</Text>
        {place ? <Text style={styles.place}>{place}</Text> : null}
        <Text style={styles.phone}>{user?.phoneMasked || ''}</Text>
        <Pressable
          onPress={() => navigation.navigate('EditProfile')}
          accessibilityRole="button"
          accessibilityLabel="Edit Profile"
          style={styles.edit}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        {stats.map((item) => (
          <View key={item.label} style={styles.stat}>
            <Text style={styles.statValue}>{item.value == null ? '—' : item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>MY PEHENLO</Text>
      <MenuRow icon="calendar-outline" label="My Rentals" onPress={() => navigation.navigate('MainTabs', { screen: 'MyRentals', params: { perspective: 'renter' } })} />
      <MenuRow icon="shirt-outline" label="My Outfit Rentals" onPress={() => navigation.navigate('MainTabs', { screen: 'MyRentals', params: { perspective: 'owner' } })} />
      <MenuRow icon="albums-outline" label="My Listings" onPress={() => navigation.navigate('MyListings')} />
      <MenuRow icon="wallet-outline" label="My Earnings" onPress={() => navigation.navigate('Earnings')} />
      <MenuRow icon="heart-outline" label="Wishlist" onPress={() => navigation.navigate('Wishlist')} />
      <MenuRow
        icon="notifications-outline"
        label="Notifications"
        detail={badgeLabel(unreadCount)}
        onPress={() => navigation.navigate('Notifications')}
      />

      <Text style={styles.section}>ACCOUNT</Text>
      <MenuRow icon="shield-checkmark-outline" label="Trust & Safety" onPress={() => navigation.navigate('SafetyCenter')} />
      <MenuRow icon="settings-outline" label="Settings" onPress={() => navigation.navigate('Settings')} />
      <MenuRow icon="log-out-outline" label="Logout" onPress={confirmLogout} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  name: { ...typography.h2, color: colors.textPrimary },
  place: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  phone: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  edit: {
    marginTop: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: { ...typography.body, fontWeight: '600', color: colors.primary },
  stats: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.h3, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  section: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    letterSpacing: 0.6,
  },
  row: {
    minHeight: 52,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  rowDetail: { ...typography.caption, color: colors.primary, fontWeight: '700' },
});

export default ProfileScreen;
