import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { EMPTY_RENTALS, PERSPECTIVE_TABS, RENTER_TABS } from '../../constants/rentalConstants';
import { ScreenContainer, AppHeader } from '../../components/common';
import RentalTabs from '../../components/rentals/RentalTabs';
import RentalList from '../../components/rentals/RentalList';
import MyOutfitRentalsScreen from './MyOutfitRentalsScreen';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { canPayBooking } from '../../utils/rentalHelpers';

const { spacing } = THEME;

const MyRentalsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [perspective, setPerspective] = useState(route.params?.perspective === 'owner' ? 'owner' : 'renter');
  const [group, setGroup] = useState('upcoming');
  const empty = EMPTY_RENTALS.renter[group];

  useFocusEffect(useCallback(() => {
    const next = route.params?.perspective;
    if (next === 'owner' || next === 'renter') {
      setPerspective(next);
      setGroup(next === 'owner' ? 'requests' : 'upcoming');
      navigation.setParams({ perspective: undefined });
    }
  }, [navigation, route.params?.perspective]));

  const changePerspective = (next) => {
    setPerspective(next);
    setGroup(next === 'owner' ? 'requests' : 'upcoming');
  };

  return (
    <ScreenContainer scroll={false} padded={false} edges={['top']}>
      <AppHeader title="My Rentals" subtitle="Manage your outfit bookings" />
      <RentalTabs tabs={PERSPECTIVE_TABS} value={perspective} onChange={changePerspective} />
      {perspective === 'owner' ? <MyOutfitRentalsScreen /> : (
        <View style={styles.panel}>
          <RentalTabs tabs={RENTER_TABS} value={group} onChange={setGroup} />
          <RentalList
            role="renter"
            group={group}
            empty={{
              ...empty,
              onAction: () => navigation.navigate('Explore'),
            }}
            onOpen={(item) => navigation.navigate('BookingDetails', { bookingId: item.id })}
            renderFooter={(item) => (
              canPayBooking(item) ? (
                <PrimaryButton
                  title="Pay Now"
                  onPress={() => navigation.navigate('Payment', { bookingId: item.id })}
                  accessibilityLabel="Pay now"
                  style={styles.pay}
                />
              ) : null
            )}
          />
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  panel: { flex: 1 },
  pay: { marginTop: spacing.sm },
});

export default MyRentalsScreen;
