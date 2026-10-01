import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { EMPTY_RENTALS, OWNER_TABS } from '../../constants/rentalConstants';
import { rentalService } from '../../services/rentalService';
import RentalTabs from '../../components/rentals/RentalTabs';
import RentalList from '../../components/rentals/RentalList';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import { bookingErrorMessage } from '../../utils/bookingErrors';
import { canOwnerAccept, rentalDateLabel } from '../../utils/rentalHelpers';
import { rupees } from '../../utils/bookingHelpers';

const { spacing } = THEME;

const MyOutfitRentalsScreen = () => {
  const navigation = useNavigation();
  const [group, setGroup] = useState('requests');
  const [busyId, setBusyId] = useState('');
  const empty = EMPTY_RENTALS.owner[group];

  const run = async (item, work, refresh) => {
    setBusyId(item.id);
    try {
      await work();
      refresh();
    } catch (error) {
      Alert.alert('Booking update', bookingErrorMessage(error, 'This booking was updated. Refresh to see the latest status.'));
      refresh();
    } finally {
      setBusyId('');
    }
  };

  const accept = (item, refresh) => {
    Alert.alert(
      'Accept rental request?',
      `${item.outfit?.title || 'Outfit'}\n${rentalDateLabel(item)}\n${item.renter?.name || 'Renter'}\nRental ${rupees(item.totalBeforeDeposit)}`,
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Accept Request', onPress: () => run(item, () => rentalService.acceptBooking(item.id), refresh) },
      ]
    );
  };

  const reject = (item, refresh) => {
    Alert.alert('Reject this request?', 'The renter will see this request as declined.', [
      { text: 'Keep request', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => run(item, () => rentalService.rejectBooking(item.id), refresh) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <RentalTabs tabs={OWNER_TABS} value={group} onChange={setGroup} />
      <RentalList
        role="owner"
        group={group}
        empty={{
          ...empty,
          onAction: empty.action ? () => navigation.navigate('MyListings') : undefined,
        }}
        onOpen={(item) => navigation.navigate('BookingDetails', { bookingId: item.id })}
        renderFooter={(item, refresh) => (
          <View style={styles.actions}>
            {canOwnerAccept(item) ? (
              <View style={styles.pair}>
                <OutlineButton
                  title="Reject"
                  onPress={() => reject(item, refresh)}
                  disabled={busyId === item.id}
                  fullWidth={false}
                  accessibilityLabel="Reject request"
                  style={styles.half}
                />
                <PrimaryButton
                  title="Accept"
                  onPress={() => accept(item, refresh)}
                  loading={busyId === item.id}
                  fullWidth={false}
                  accessibilityLabel="Accept request"
                  style={styles.half}
                />
              </View>
            ) : null}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  actions: { marginTop: spacing.sm },
  pair: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
});

export default MyOutfitRentalsScreen;
