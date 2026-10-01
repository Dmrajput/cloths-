import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { APP_NAME, AUTH_TAGLINE } from '../../constants/appConstants';
import { THEME } from '../../constants/theme';
import { SafeAreaView, ErrorState } from '../../components/common';

const { colors, typography, spacing } = THEME;

const SplashScreen = ({ sessionError, onRetry }) => {
  const started = useRef(false);

  useEffect(() => {
    if (started.current || sessionError) return;
    started.current = true;
    onRetry?.();
  }, [onRetry, sessionError]);

  if (sessionError) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ErrorState
          title="Unable to connect"
          message="Please check your internet connection and try again."
          actionLabel="Try Again"
          onActionPress={onRetry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.brand} accessibilityRole="header">{APP_NAME.toUpperCase()}</Text>
      <Text style={styles.tagline}>{AUTH_TAGLINE}</Text>
      <ActivityIndicator
        style={styles.spinner}
        size="large"
        color={colors.primary}
        accessibilityLabel="Checking your session"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  brand: {
    ...typography.display,
    color: colors.primary,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  tagline: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  spinner: {
    marginTop: spacing.xxxl,
  },
});

export default SplashScreen;
