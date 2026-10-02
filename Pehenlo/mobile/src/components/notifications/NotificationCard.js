import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { CATEGORY_ICONS } from '../../constants/notificationConstants';
import { formatNotificationTime } from '../../utils/notificationHelpers';

const { colors, typography, spacing, radius } = THEME;

const NotificationCard = ({ notification, onPress, onMarkRead }) => {
  const unread = !notification?.isRead;
  const icon = CATEGORY_ICONS[notification?.category] || 'notifications-outline';
  return (
    <Pressable
      onPress={() => {
        if (!notification?.isRead) onMarkRead?.(notification);
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${notification?.title}. ${notification?.message}`}
      style={[styles.card, unread && styles.unread]}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
      <View style={styles.copy}>
        <Text style={[styles.title, unread && styles.titleUnread]}>{notification?.title}</Text>
        <Text style={styles.message}>{notification?.message}</Text>
        <Text style={styles.time}>{formatNotificationTime(notification?.createdAt)}</Text>
      </View>
      {unread ? <View style={styles.dot} accessibilityLabel="Unread" /> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  unread: { backgroundColor: '#FFF9F4' },
  copy: { flex: 1 },
  title: { ...typography.body, color: colors.textPrimary },
  titleUnread: { fontWeight: '700' },
  message: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  time: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
});

export default NotificationCard;
