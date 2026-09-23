import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import ScreenContainer from './ScreenContainer';
import AppHeader from './AppHeader';

const { colors, typography, spacing } = THEME;

/**
 * Shared polished placeholder for secondary screens in Phase 1.
 */
const PlaceholderScreen = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  children,
}) => {
  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      {showBack || title ? (
        <AppHeader title={title} showBack={showBack} onBack={onBack} />
      ) : null}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
        <Text style={styles.hint}>Pehenlo · Phase 1 placeholder</Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xxl,
  },
});

export default PlaceholderScreen;
