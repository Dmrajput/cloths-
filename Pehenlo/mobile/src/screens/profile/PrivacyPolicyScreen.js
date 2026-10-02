import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';

const { colors, typography, spacing } = THEME;

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="Privacy Policy" showBack onBack={() => navigation.goBack()} />
      <Text style={styles.body}>
        Your profile is private. Pehenlo shows other people only the details needed to rent an outfit, such as a first name and city. Your phone number, email, and payout account stay on your account.
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

export default PrivacyPolicyScreen;
