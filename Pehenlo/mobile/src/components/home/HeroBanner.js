import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { PrimaryButton } from '../buttons';

const { colors, typography, spacing, radius } = THEME;

const HeroBanner = ({ title, subtitle, buttonText = 'Explore Now', onPress }) => {
  return (
    <View style={styles.banner} accessibilityRole="summary">
      <Text style={styles.kicker}>PEHENLO</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <PrimaryButton
        title={buttonText}
        onPress={onPress}
        fullWidth={false}
        accessibilityLabel={buttonText}
        style={styles.button}
        textStyle={styles.buttonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  kicker: {
    ...typography.caption,
    color: colors.secondaryLight,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.secondaryLight,
    marginBottom: spacing.lg,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    color: colors.primaryDark,
  },
});

export default HeroBanner;
