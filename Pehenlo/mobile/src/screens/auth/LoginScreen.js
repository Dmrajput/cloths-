import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { APP_NAME, PHONE_CONFIG } from '../../constants/appConstants';
import { THEME } from '../../constants/theme';
import { ScreenContainer } from '../../components/common';
import { AppInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { authService } from '../../services/authService';
import { getAuthErrorMessage, normalizeIndianMobile } from '../../utils/validation';

const { colors, typography, spacing } = THEME;

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChangePhone = (value) => {
    setPhone(value.replace(/\D/g, '').slice(0, PHONE_CONFIG.nationalLength));
    if (error) setError('');
  };

  const onContinue = async () => {
    const normalized = normalizeIndianMobile(phone);
    if (!normalized) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.sendOTP(normalized);
      navigation.navigate('OTP', {
        phone: normalized,
        displayPhone: `${PHONE_CONFIG.dialCode} ${phone.slice(0, 5)} ${phone.slice(5)}`,
      });
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.brand}>{APP_NAME}</Text>
        <Text style={styles.heading} accessibilityRole="header">
          Welcome to Pehenlo
        </Text>
        <Text style={styles.body}>
          Rent traditional outfits. Wear them. Return them.
        </Text>

        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.dialCode}>
            <Text style={styles.dialCodeText}>{PHONE_CONFIG.dialCode}</Text>
          </View>
          <View style={styles.phoneInput}>
            <AppInput
              value={phone}
              onChangeText={onChangePhone}
              placeholder="Enter mobile number"
              keyboardType="number-pad"
              maxLength={PHONE_CONFIG.nationalLength}
              error={error}
              accessibilityLabel="Mobile number"
            />
          </View>
        </View>

        <PrimaryButton
          title={loading ? 'Sending OTP...' : 'Continue'}
          onPress={onContinue}
          disabled={loading}
          accessibilityLabel="Continue"
          style={styles.cta}
        />

        <Text style={styles.legal}>
          By continuing, you agree to our Terms & Conditions and Privacy Policy.
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.huge,
  },
  brand: {
    ...typography.label,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  heading: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dialCode: {
    height: 48,
    minWidth: 64,
    marginTop: 0,
    marginRight: spacing.sm,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  dialCodeText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
  },
  cta: {
    marginTop: spacing.md,
  },
  legal: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default LoginScreen;
