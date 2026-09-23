import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';

const { colors, typography, spacing } = THEME;

const Screen = () => {
  const navigation = useNavigation();

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader
        title="Search"
        showBack
        onBack={() => navigation.goBack()}
      />
      <Text style={styles.title}>Search</Text>
      <Text style={styles.subtitle}>Search traditional outfits near you.</Text>
      <Text style={styles.hint}>Pehenlo · Phase 1 placeholder</Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
  },
});

export default Screen;
