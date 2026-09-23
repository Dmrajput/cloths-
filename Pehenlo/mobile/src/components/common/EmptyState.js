import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import PrimaryButton from '../buttons/PrimaryButton';

const { colors, typography, spacing } = THEME;

const EmptyState = ({
  icon = 'heart-outline',
  title,
  message,
  actionLabel,
  onActionPress,
  style,
}) => (
  <View
    style={[styles.container, style]}
    accessibilityRole="text"
    accessibilityLabel={[title, message].filter(Boolean).join('. ')}
  >
    <View style={styles.iconWrap}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
    </View>

    {title ? <Text style={styles.title}>{title}</Text> : null}
    {message ? <Text style={styles.message}>{message}</Text> : null}

    {actionLabel && onActionPress ? (
      <PrimaryButton
        title={actionLabel}
        onPress={onActionPress}
        fullWidth={false}
        style={styles.action}
        accessibilityLabel={actionLabel}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  iconWrap: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  action: {
    minWidth: 160,
  },
});

export default EmptyState;
