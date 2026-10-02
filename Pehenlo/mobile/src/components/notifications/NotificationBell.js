import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import NotificationBadge from './NotificationBadge';

const { colors } = THEME;

const NotificationBell = ({ count = 0, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
    hitSlop={8}
    style={({ pressed }) => [styles.button, pressed && styles.pressed]}
  >
    <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
    <NotificationBadge count={count} />
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});

export default NotificationBell;
