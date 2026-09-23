import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { APP_NAME } from '../../constants/appConstants';
import { ScreenContainer, AppHeader } from '../../components/common';
import { AppInput } from '../../components/inputs';
import { PrimaryButton, TextButton } from '../../components/buttons';

const { colors, typography, spacing } = THEME;

const LoginScreen = ({ navigation }) => {
  return (
    <ScreenContainer scroll edges={['top', 'bottom']}>
      <AppHeader title="Welcome" showBack={false} />

      <View style={styles.content}>
        <Text style={styles.brand}>{APP_NAME}</Text>
        <Text style={styles.heading}>Login</Text>
        <Text style={styles.body}>
          Sign in with your phone number. OTP verification arrives in Phase 2.
        </Text>

        <AppInput
          label="Phone number"
          placeholder="Enter mobile number"
          keyboardType="phone-pad"
          leftIcon="call-outline"
          value=""
          onChangeText={() => {}}
        />

        <PrimaryButton
          title="Send OTP"
          onPress={() => navigation?.navigate?.('OTP')}
          style={styles.cta}
        />

        <TextButton
          title="Skip for now (dev)"
          onPress={() => {}}
          style={styles.skip}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
  },
  brand: {
    ...typography.label,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  heading: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  cta: {
    marginTop: spacing.lg,
  },
  skip: {
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
});

export default LoginScreen;
