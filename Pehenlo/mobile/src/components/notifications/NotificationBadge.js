import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { badgeLabel } from '../../utils/notificationHelpers';

const { colors } = THEME;

const NotificationBadge = ({ count }) => {
  const label = badgeLabel(count);
  if (!label) return null;
  return (
    <View style={styles.badge} accessibilityLabel={`${label} unread`}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: '700',
  },
});

export default NotificationBadge;
