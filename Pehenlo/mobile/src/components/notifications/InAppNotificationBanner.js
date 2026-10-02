import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { useNotifications } from '../../context/NotificationContext';

const { colors, typography, spacing, radius } = THEME;

const InAppNotificationBanner = () => {
  const insets = useSafeAreaInsets();
  const { banner, dismissBanner, openNotification } = useNotifications();
  if (!banner) return null;
  return (
    <Pressable
      onPress={() => openNotification({ data: banner.data, isRead: true })}
      accessibilityRole="button"
      accessibilityLabel={`${banner.title}. ${banner.message}`}
      style={[styles.banner, { top: insets.top + spacing.sm }]}
    >
      <Text style={styles.title}>{banner.title}</Text>
      <Text style={styles.message}>{banner.message}</Text>
      <Pressable onPress={dismissBanner} accessibilityRole="button" accessibilityLabel="Dismiss notification" style={styles.close}>
        <Text style={styles.closeText}>Close</Text>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  message: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  close: { minHeight: 44, justifyContent: 'center' },
  closeText: { ...typography.caption, color: colors.primary },
});

export default InAppNotificationBanner;
