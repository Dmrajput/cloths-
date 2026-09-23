import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { APP_NAME, APP_TAGLINE, DEFAULT_LOCATION, CATEGORIES } from '../../constants/appConstants';
import { ScreenContainer, AppHeader, Divider } from '../../components/common';
import { PrimaryButton } from '../../components/buttons';
import { CategoryCard, OutfitCard, SectionCard } from '../../components/cards';

const { colors, typography, spacing } = THEME;

const SAMPLE_OUTFIT = {
  title: 'Designer Lehenga',
  price: '1,499',
  duration: '2 days',
  rating: 4.8,
  distance: '2.4 km',
  isFavorite: false,
};

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader
        location={DEFAULT_LOCATION}
        showNotification
        onNotificationPress={() => {}}
      />

      <View style={styles.content}>
        <Text style={styles.brand} accessibilityRole="header">
          {APP_NAME}
        </Text>
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>

        <SectionCard title="Home Screen" style={styles.section}>
          <Text style={styles.body}>Design system is working.</Text>
          <Text style={styles.muted}>
            Browse traditional outfits, rent with confidence, and list your own.
          </Text>
          <PrimaryButton
            title="Explore Outfits"
            onPress={() => navigation.navigate('Explore')}
            style={styles.cta}
          />
        </SectionCard>

        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.slice(0, 4).map((name) => (
            <CategoryCard
              key={name}
              name={name}
              icon="shirt-outline"
              onPress={() => navigation.navigate('Explore')}
              style={styles.categoryCard}
            />
          ))}
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Featured preview</Text>
        <OutfitCard
          {...SAMPLE_OUTFIT}
          onPress={() => navigation.navigate('OutfitDetails')}
          onFavoritePress={() => {}}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  brand: {
    ...typography.display,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  body: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  muted: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  cta: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryCard: {
    width: '47%',
  },
  divider: {
    marginVertical: spacing.lg,
  },
});

export default HomeScreen;
