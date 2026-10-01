import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer } from '../../components/common';
import { OutlineButton, PrimaryButton } from '../../components/buttons';

const { colors, typography, spacing } = THEME;

const ListingSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const listingId = route.params?.listingId;

  return (
    <ScreenContainer>
      <View style={styles.wrap}>
        <Text style={styles.title}>Listing submitted</Text>
        <Text style={styles.body}>
          Your outfit has been submitted for review. We’ll let you know when it is approved. It is not public yet.
        </Text>
        {listingId ? <Text style={styles.id}>Listing ID: {listingId}</Text> : null}
        <Text style={styles.status}>Status: Pending approval</Text>
        <PrimaryButton
          title="View My Listing"
          onPress={() => navigation.navigate('OutfitDetails', { listingId })}
          accessibilityLabel="View my listing"
        />
        <OutlineButton
          title="Back to Home"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          style={styles.secondary}
          accessibilityLabel="Back to home"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  id: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  status: {
    ...typography.label,
    color: colors.secondary,
    marginBottom: spacing.xl,
  },
  secondary: {
    marginTop: spacing.md,
  },
});

export default ListingSuccessScreen;
