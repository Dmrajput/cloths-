import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { FULFILLMENT } from '../../constants/bookingConstants';
import { listingService } from '../../services/listingService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';
import DateRangeSummary from '../../components/booking/DateRangeSummary';
import BookingPriceBreakdown from '../../components/booking/BookingPriceBreakdown';
import FulfillmentSelector from '../../components/booking/FulfillmentSelector';
import AppInput from '../../components/inputs/AppInput';
import AppTextArea from '../../components/inputs/AppTextArea';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { ErrorState } from '../../components/common';
import { bookingErrorMessage } from '../../utils/bookingErrors';

const { colors, typography, spacing } = THEME;

const emptyAddress = (user) => ({
  name: user?.name || '',
  phone: user?.phone || '',
  addressLine1: '',
  addressLine2: '',
  area: '',
  city: user?.city || '',
  state: user?.state || '',
  pincode: '',
});

const CreateBookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { listingId, startDate, endDate } = route.params || {};
  const [listing, setListing] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [method, setMethod] = useState('');
  const [address, setAddress] = useState(() => emptyAddress(user));
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const loadPrice = async (nextMethod, currentListing) => {
    const outfit = currentListing || listing;
    if (!outfit || !nextMethod) return;
    const response = await bookingService.getBookingPrice(listingId, {
      startDate,
      endDate,
      fulfillmentMethod: nextMethod,
    });
    setPricing(response?.data || null);
  };

  const load = async () => {
    if (!listingId || !startDate || !endDate) {
      setLoading(false);
      setError('Choose rental dates before sending a request.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await listingService.getListingById(listingId);
      const nextListing = response?.data?.listing;
      if (!nextListing) throw new Error('Missing listing');
      const nextMethod = nextListing.pickupAvailable ? FULFILLMENT.PICKUP : FULFILLMENT.DELIVERY;
      setListing(nextListing);
      setMethod(nextMethod);
      await loadPrice(nextMethod, nextListing);
    } catch (loadError) {
      setError(bookingErrorMessage(loadError, 'Unable to prepare this booking.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [listingId, startDate, endDate]);

  const changeMethod = async (nextMethod) => {
    setMethod(nextMethod);
    setFormError('');
    try {
      await loadPrice(nextMethod);
    } catch (priceError) {
      setFormError(bookingErrorMessage(priceError, 'Unable to update the price.'));
    }
  };

  const setField = (key, value) => setAddress((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!pricing || submitting) return;
    setSubmitting(true);
    setFormError('');
    try {
      const response = await bookingService.createBooking({
        listingId,
        startDate,
        endDate,
        fulfillmentMethod: method,
        deliveryAddress: method === FULFILLMENT.DELIVERY ? address : null,
        renterNote: note.trim(),
        expectedTotalBeforeDeposit: pricing.totalBeforeDeposit,
      });
      navigation.replace('BookingDetails', { bookingId: response?.data?.booking?.id });
    } catch (submitError) {
      if (submitError.code === 'PRICE_CHANGED' && submitError.data?.pricing) {
        setPricing(submitError.data.pricing);
      }
      setFormError(bookingErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.header}>Booking summary</Text>
        <View style={styles.back} />
      </View>
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {!loading && error ? <ErrorState title="Unable to prepare booking" message={error} onActionPress={load} /> : null}
      {!loading && listing ? (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>{listing.title}</Text>
            <DateRangeSummary startDate={startDate} endDate={endDate} minimumDays={listing.rentalDays || 1} />
            <Text style={styles.section}>Pickup or delivery</Text>
            <FulfillmentSelector
              pickupAvailable={listing.pickupAvailable}
              deliveryAvailable={listing.deliveryAvailable}
              value={method}
              onChange={changeMethod}
            />
            {method === FULFILLMENT.PICKUP ? (
              <Text style={styles.note}>Pickup area { [listing.pickupArea, listing.city].filter(Boolean).join(', ') || listing.city }</Text>
            ) : null}
            {method === FULFILLMENT.DELIVERY ? (
              <View>
                <AppInput label="Name" value={address.name} onChangeText={(value) => setField('name', value)} />
                <AppInput label="Phone" value={address.phone} onChangeText={(value) => setField('phone', value)} keyboardType="phone-pad" />
                <AppInput label="Address" value={address.addressLine1} onChangeText={(value) => setField('addressLine1', value)} />
                <AppInput label="Address line 2" value={address.addressLine2} onChangeText={(value) => setField('addressLine2', value)} />
                <AppInput label="Area" value={address.area} onChangeText={(value) => setField('area', value)} />
                <AppInput label="City" value={address.city} onChangeText={(value) => setField('city', value)} />
                <AppInput label="State" value={address.state} onChangeText={(value) => setField('state', value)} />
                <AppInput label="Pincode" value={address.pincode} onChangeText={(value) => setField('pincode', value)} keyboardType="number-pad" maxLength={6} />
              </View>
            ) : null}
            <AppTextArea
              label="Message to owner"
              value={note}
              onChangeText={setNote}
              maxLength={500}
              placeholder="Optional note for the owner"
            />
            <BookingPriceBreakdown pricing={pricing} />
            <Text style={styles.waiting}>Your booking is not confirmed until the owner accepts.</Text>
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <PrimaryButton
              title="Send Booking Request"
              onPress={submit}
              loading={submitting}
              disabled={!pricing}
              accessibilityLabel="Send booking request"
            />
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { ...typography.h2, color: colors.textPrimary },
  header: { ...typography.h3, color: colors.textPrimary },
  loader: { marginTop: spacing.xl },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { ...typography.h2, color: colors.textPrimary },
  section: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg },
  note: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
  waiting: { ...typography.body, color: colors.textSecondary, marginTop: spacing.lg },
  formError: { ...typography.body, color: colors.error, marginTop: spacing.md },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});

export default CreateBookingScreen;
