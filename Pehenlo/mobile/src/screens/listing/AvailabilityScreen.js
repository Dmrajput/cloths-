import { StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';

const { colors, typography, spacing } = THEME;

const Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const checking = route.params?.intent === 'check';

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader
        title="Availability"
        showBack
        onBack={() => navigation.goBack()}
      />
      <Text style={styles.title}>{checking ? 'Check availability' : 'Availability'}</Text>
      <Text style={styles.subtitle}>
        {checking
          ? 'Availability booking will be available in the next step.'
          : 'Manage when your outfit can be rented.'}
      </Text>
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
});

export default Screen;
