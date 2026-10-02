import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';

const { colors, typography, spacing } = THEME;

const TermsScreen = () => {
  const navigation = useNavigation();

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="Terms & Conditions" showBack onBack={() => navigation.goBack()} />
      <Text style={styles.body}>
        Rentals, payments, and payouts follow the booking you confirm in the app. Deactivating an account does not remove booking or payout records needed for reconciliation.
      </Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  body: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.lg,
  },
});

export default TermsScreen;
