import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { OTP_LENGTH, OTP_RESEND_SECONDS } from '../../constants/appConstants';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';
import { PrimaryButton, TextButton } from '../../components/buttons';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { getAuthErrorMessage } from '../../utils/validation';

const { colors, typography, spacing, radius } = THEME;

const OTPScreen = ({ navigation, route }) => {
  const { phone, displayPhone } = route.params || {};
  const { login } = useAuth();
  const inputRef = useRef(null);
  const submittedCode = useRef('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const verify = async (otp) => {
    if (loading || !phone) return;
    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyOTP(phone, otp);
      const nextUser = response?.data?.user;
      const nextToken = response?.data?.token;
      if (!nextUser || !nextToken) {
        throw Object.assign(new Error('Something went wrong'), { code: 'SERVER_ERROR' });
      }
      await login(nextToken, nextUser);
    } catch (requestError) {
      submittedCode.current = '';
      setError(getAuthErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code.length < OTP_LENGTH) {
      submittedCode.current = '';
      return;
    }
    if (submittedCode.current === code || loading) return;
    submittedCode.current = code;
    verify(code);
  }, [code]);

  const onChangeCode = (value) => {
    const next = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(next);
    if (error) setError('');
  };

  const onResend = async () => {
    if (secondsLeft > 0 || resending || !phone) return;
    setResending(true);
    setError('');
    try {
      await authService.sendOTP(phone);
      setCode('');
      submittedCode.current = '';
      setSecondsLeft(OTP_RESEND_SECONDS);
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError));
    } finally {
      setResending(false);
    }
  };

  return (
    <ScreenContainer scroll edges={['top', 'bottom']}>
      <AppHeader title="Verify" showBack onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">
          Verify your number
        </Text>
        <Text style={styles.body}>We sent a 6-digit OTP to</Text>
        <Text style={styles.phone}>{displayPhone || phone}</Text>

        <Pressable
          onPress={() => inputRef.current?.focus()}
          accessibilityRole="none"
          style={styles.otpRow}
        >
          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
            const filled = Boolean(code[index]);
            const active = index === code.length;
            return (
              <View
                key={index}
                style={[
                  styles.otpCell,
                  (filled || active) && styles.otpCellActive,
                  error && styles.otpCellError,
                ]}
              >
                <Text style={styles.otpDigit}>{code[index] || ''}</Text>
              </View>
            );
          })}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={onChangeCode}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={OTP_LENGTH}
          autoFocus
          style={styles.hiddenInput}
          accessibilityLabel="One time password"
        />

        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <Text style={styles.resendLabel}>Didn't receive the code?</Text>
        {secondsLeft > 0 ? (
          <Text style={styles.resendWait}>Resend OTP in {secondsLeft} seconds</Text>
        ) : (
          <TextButton
            title={resending ? 'Sending...' : 'Resend OTP'}
            onPress={onResend}
            disabled={resending}
            accessibilityLabel="Resend OTP"
            style={styles.resendButton}
          />
        )}

        <TextButton
          title="Change phone number"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Change phone number"
          style={styles.changeNumber}
        />

        <PrimaryButton
          title={loading ? 'Verifying...' : 'Verify'}
          onPress={() => verify(code)}
          disabled={loading || code.length !== OTP_LENGTH}
          accessibilityLabel="Verify"
          style={styles.cta}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
  },
  heading: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  phone: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  otpCell: {
    width: 46,
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpCellActive: {
    borderColor: colors.primary,
  },
  otpCellError: {
    borderColor: colors.error,
  },
  otpDigit: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.md,
  },
  resendLabel: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  resendWait: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  changeNumber: {
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  cta: {
    marginTop: spacing.xxl,
  },
});

export default OTPScreen;
