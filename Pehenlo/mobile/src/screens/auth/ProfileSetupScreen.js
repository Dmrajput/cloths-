import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';
import { AppInput, SelectInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';

const { colors, typography, spacing } = THEME;

const ProfileSetupScreen = ({ navigation }) => {
  return (
    <ScreenContainer scroll edges={['top', 'bottom']}>
      <AppHeader
        title="Profile Setup"
        showBack
        onBack={() => navigation?.goBack?.()}
      />

      <View style={styles.content}>
        <Text style={styles.heading}>Complete your profile</Text>
        <Text style={styles.body}>
          Visual placeholder — profile save and KYC arrive later.
        </Text>

        <AppInput
          label="Full name"
          placeholder="Your name"
          value=""
          onChangeText={() => {}}
        />

        <SelectInput
          label="City"
          placeholder="Select city"
          value=""
          onPress={() => {}}
          style={styles.field}
        />

        <PrimaryButton title="Save & Continue" onPress={() => {}} style={styles.cta} />
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
  field: {
    marginTop: spacing.md,
  },
  cta: {
    marginTop: spacing.xl,
  },
});

export default ProfileSetupScreen;
