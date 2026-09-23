import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';
import { AppInput } from '../../components/inputs';
import { PrimaryButton, TextButton } from '../../components/buttons';

const { colors, typography, spacing } = THEME;

const OTPScreen = ({ navigation }) => {
  return (
    <ScreenContainer scroll edges={['top', 'bottom']}>
      <AppHeader
        title="Verify OTP"
        showBack
        onBack={() => navigation?.goBack?.()}
      />

      <View style={styles.content}>
        <Text style={styles.heading}>Enter OTP</Text>
        <Text style={styles.body}>
          Placeholder only — real OTP verification is Phase 2.
        </Text>

        <AppInput
          label="6-digit code"
          placeholder="• • • • • •"
          keyboardType="number-pad"
          value=""
          onChangeText={() => {}}
        />

        <PrimaryButton
          title="Verify"
          onPress={() => navigation?.navigate?.('ProfileSetup')}
          style={styles.cta}
        />

        <TextButton title="Resend OTP" onPress={() => {}} style={styles.resend} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
  },
  heading: {
    ...typography.h2,
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
  resend: {
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
});

export default OTPScreen;
