import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { APP_NAME, APP_TAGLINE } from '../../constants/appConstants';
import { ScreenContainer } from '../../components/common';
import { PrimaryButton } from '../../components/buttons';

const { colors, typography, spacing } = THEME;

const SplashScreen = ({ navigation }) => {
  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.brand} accessibilityRole="header">
          {APP_NAME}
        </Text>
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
        <Text style={styles.hint}>Splash · Phase 1 placeholder</Text>

        <PrimaryButton
          title="Continue"
          onPress={() => navigation?.navigate?.('Login')}
          style={styles.cta}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  brand: {
    ...typography.display,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xxxl,
  },
  cta: {
    maxWidth: 280,
    alignSelf: 'stretch',
  },
});

export default SplashScreen;
