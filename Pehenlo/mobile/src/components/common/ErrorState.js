import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import OutlineButton from '../buttons/OutlineButton';

const { colors, typography, spacing } = THEME;

const ErrorState = ({
  title = 'Something went wrong',
  message = 'Please try again.',
  actionLabel = 'Try Again',
  onActionPress,
  style,
}) => (
  <View
    style={[styles.container, style]}
    accessibilityRole="alert"
    accessibilityLabel={[title, message].filter(Boolean).join('. ')}
  >
    <View style={styles.iconWrap}>
      <Ionicons name="alert-circle" size={48} color={colors.error} />
    </View>

    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>

    {onActionPress ? (
      <OutlineButton
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

export default ErrorState;
