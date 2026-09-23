import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing } = THEME;

const LoadingSpinner = ({ message = 'Loading...', size = 'large', style }) => (
  <View
    style={[styles.container, style]}
    accessibilityRole="progressbar"
    accessibilityLabel={message}
  >
    <ActivityIndicator size={size} color={colors.primary} />
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  message: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
