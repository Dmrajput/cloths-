import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';
import { PrimaryButton, OutlineButton } from '../../components/buttons';
import { SectionCard } from '../../components/cards';

const { colors, typography, spacing, radius } = THEME;

const ListOutfitScreen = () => {
  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="List Outfit" />

      <View style={styles.content}>
        <View style={styles.heroIcon} accessibilityRole="image">
          <Ionicons name="shirt-outline" size={40} color={colors.primary} />
        </View>

        <Text style={styles.heading}>List Outfit</Text>
        <Text style={styles.body}>
          List your traditional outfit and earn from it.
        </Text>

        <SectionCard style={styles.card}>
          <Text style={styles.cardTitle}>Coming in a later phase</Text>
          <Text style={styles.cardBody}>
            Photo upload, pricing, availability, and listing details will live here.
            For now, this screen shows the Pehenlo design foundation.
          </Text>
        </SectionCard>

        <PrimaryButton title="Start Listing" onPress={() => {}} disabled />
        <OutlineButton
          title="View My Listings"
          onPress={() => {}}
          style={styles.secondary}
          disabled
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    alignItems: 'stretch',
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.xl,
  },
  cardTitle: {
    ...typography.label,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  secondary: {
    marginTop: spacing.md,
  },
});

export default ListOutfitScreen;
