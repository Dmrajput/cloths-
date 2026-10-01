import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { DEFAULT_LOCATION } from '../../constants/appConstants';
import { ScreenContainer } from '../../components/common';
import { AppInput } from '../../components/inputs';
import { PrimaryButton, TextButton } from '../../components/buttons';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { getAuthErrorMessage, isValidEmail } from '../../utils/validation';

const { colors, typography, spacing } = THEME;

const ProfileSetupScreen = () => {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || DEFAULT_LOCATION);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    const trimmedName = name.trim().replace(/\s+/g, ' ');
    const trimmedCity = city.trim().replace(/\s+/g, ' ');
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (trimmedCity.length < 2) {
      setError('City is required.');
      return;
    }
    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await userService.updateProfile({
        name: trimmedName,
        city: trimmedCity,
        email: trimmedEmail,
      });
      if (response?.data?.user) {
        setUser(response.data.user);
      }
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">
          Complete your profile
        </Text>
        <Text style={styles.body}>Add your name so other people know who they are renting with.</Text>

        <AppInput
          label="Your name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          maxLength={60}
          autoCapitalize="words"
        />
        <AppInput
          label="Email (optional)"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={120}
        />
        <AppInput
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="Ahmedabad"
          autoCapitalize="words"
          maxLength={80}
        />

        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <PrimaryButton
          title={loading ? 'Saving...' : 'Continue'}
          onPress={onContinue}
          disabled={loading}
          accessibilityLabel="Continue"
          style={styles.cta}
        />
        <TextButton
          title="Use a different number"
          onPress={logout}
          accessibilityLabel="Use a different number"
          style={styles.switchAccount}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.huge,
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
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.md,
  },
  cta: {
    marginTop: spacing.md,
  },
  switchAccount: {
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
});

export default ProfileSetupScreen;
