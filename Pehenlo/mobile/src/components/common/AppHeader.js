import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing } = THEME;

const SIDE_WIDTH = 80;

const AppHeader = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  onRightPress,
  showNotification = false,
  onNotificationPress,
  location,
  onLocationPress,
  style,
}) => {
  const renderRightAction = () => {
    if (typeof rightAction === 'string') {
      return (
        <Pressable
          onPress={onRightPress}
          accessibilityRole="button"
          accessibilityLabel={rightAction}
          hitSlop={8}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons name={rightAction} size={22} color={colors.textPrimary} />
        </Pressable>
      );
    }

    if (rightAction) {
      return rightAction;
    }

    return null;
  };

  const renderLeft = () => {
    if (showBack) {
      return (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.side, styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
      );
    }

    if (location) {
      return (
        <Pressable
          onPress={onLocationPress}
          disabled={!onLocationPress}
          accessibilityRole="button"
          accessibilityLabel={`Location: ${location}`}
          style={({ pressed }) => [
            styles.side,
            styles.locationButton,
            pressed && onLocationPress && styles.pressed,
          ]}
        >
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {location}
          </Text>
        </Pressable>
      );
    }

    return <View style={styles.side} />;
  };

  const renderRight = () => {
    const hasRightContent = showNotification || rightAction;

    if (!hasRightContent) {
      return <View style={styles.side} />;
    }

    return (
      <View style={[styles.side, styles.rightSide]}>
        {showNotification ? (
          <Pressable
            onPress={onNotificationPress}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        ) : null}
        {rightAction ? (
          <View style={showNotification ? styles.rightActionSpacing : null}>
            {renderRightAction()}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]} accessibilityRole="header">
      {renderLeft()}

      <View style={styles.center}>
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {renderRight()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  side: {
    width: SIDE_WIDTH,
    minHeight: 40,
    justifyContent: 'center',
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rightActionSpacing: {
    marginLeft: spacing.xs,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: SIDE_WIDTH,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});

export default AppHeader;
