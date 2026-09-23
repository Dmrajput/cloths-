import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';
import { SearchInput } from '../../components/inputs';
import { OutlineButton } from '../../components/buttons';
import { OutfitCard } from '../../components/cards';

const { colors, typography, spacing } = THEME;

const ExploreScreen = () => {
  const navigation = useNavigation();

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader
        title="Explore"
        showNotification
        onNotificationPress={() => {}}
      />

      <View style={styles.content}>
        <SearchInput
          placeholder="Search outfits..."
          value=""
          onChangeText={() => {}}
          onClear={() => {}}
        />

        <View style={styles.actions}>
          <OutlineButton
            title="Filters"
            fullWidth={false}
            onPress={() => navigation.navigate('Filter')}
            style={styles.filterBtn}
          />
        </View>

        <Text style={styles.heading}>Explore Screen</Text>
        <Text style={styles.body}>
          Discover traditional and ethnic wear near you. Full search arrives in a later phase.
        </Text>

        <OutfitCard
          title="Banarasi Silk Saree"
          price="999"
          duration="3 days"
          rating={4.9}
          distance="1.2 km"
          isFavorite
          onPress={() => navigation.navigate('OutfitDetails')}
          onFavoritePress={() => {}}
          style={styles.card}
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
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  filterBtn: {
    paddingHorizontal: spacing.xl,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.lg,
  },
});

export default ExploreScreen;
