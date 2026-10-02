import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader, EmptyState, ErrorState } from '../../components/common';
import NotificationCard from '../../components/notifications/NotificationCard';
import { useNotifications } from '../../context/NotificationContext';
import { NOTIFICATION_CATEGORIES } from '../../constants/notificationConstants';

const { colors, typography, spacing } = THEME;

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [category, setCategory] = useState('');
  const {
    items,
    loading,
    refreshing,
    loadingMore,
    error,
    hasNextPage,
    fetchNotifications,
    refreshNotifications,
    loadMoreNotifications,
    markAllAsRead,
    openNotification,
  } = useNotifications();

  useFocusEffect(useCallback(() => {
    fetchNotifications({ page: 1, category, replace: true });
  }, [category, fetchNotifications]));

  const changeCategory = (value) => {
    setCategory(value);
  };

  return (
    <ScreenContainer scroll={false} padded={false} edges={['top']}>
      <AppHeader
        title="Notifications"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={(
          <Pressable onPress={markAllAsRead} accessibilityRole="button" accessibilityLabel="Mark all as read" style={styles.markAll}>
            <Text style={styles.markAllText}>Read</Text>
          </Pressable>
        )}
      />
      <View style={styles.filters}>
        {NOTIFICATION_CATEGORIES.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => changeCategory(item.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: category === item.value }}
            style={[styles.filter, category === item.value && styles.filterOn]}
          >
            <Text style={styles.filterText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      {loading && !items.length ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {!loading && error && !items.length ? (
        <ErrorState title="Couldn't load notifications." message="Try again." onActionPress={() => fetchNotifications({ page: 1, category, replace: true })} />
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refreshNotifications(category)} tintColor={colors.primary} />}
        onEndReached={() => {
          if (hasNextPage) loadMoreNotifications(category);
        }}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} /> : null}
        ListEmptyComponent={!loading && !error ? (
          <EmptyState
            icon="notifications-outline"
            title="No notifications yet"
            message="You'll see booking, payment, rental and account updates here."
          />
        ) : null}
        renderItem={({ item }) => (
          <NotificationCard notification={item} onPress={() => openNotification(item)} />
        )}
      />
      <Pressable onPress={() => navigation.navigate('NotificationPreferences')} accessibilityRole="button" accessibilityLabel="Notification preferences" style={styles.prefs}>
        <Text style={styles.prefsText}>Notification preferences</Text>
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  markAll: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.xs },
  markAllText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
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
  loader: { marginTop: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  prefs: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  prefsText: { ...typography.body, color: colors.primary, fontWeight: '600' },
});

export default NotificationsScreen;
