import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader, EmptyState } from '../../components/common';

const { colors, typography, spacing } = THEME;

const MyRentalsScreen = () => {
  const navigation = useNavigation();

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="My Rentals" />

      <View style={styles.content}>
        <Text style={styles.heading}>My Rentals</Text>
        <Text style={styles.body}>Your rentals will appear here.</Text>

        <EmptyState
          icon="cube-outline"
          title="No rentals yet"
          message="Start exploring traditional outfits on Pehenlo."
          actionLabel="Explore Outfits"
          onActionPress={() => navigation.navigate('Explore')}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
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
});

export default MyRentalsScreen;
