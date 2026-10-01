import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { listingService } from '../../services/listingService';
import { bookingService } from '../../services/bookingService';
import AvailabilityCalendar from '../../components/booking/AvailabilityCalendar';
import DateRangeSummary from '../../components/booking/DateRangeSummary';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { ErrorState } from '../../components/common';
import {
  businessTodayKey,
  currentBusinessMonth,
  expandUnavailable,
  monthKey,
  rangeHitsUnavailable,
  rentalDays,
  rupees,
  shiftMonth,
} from '../../utils/bookingHelpers';
import { bookingErrorMessage } from '../../utils/bookingErrors';

const { colors, typography, spacing } = THEME;

const AvailabilityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const listingId = route.params?.listingId;
  const today = businessTodayKey();
  const initialMonth = currentBusinessMonth();
  const [listing, setListing] = useState(null);
  const [cursor, setCursor] = useState(initialMonth);
  const [monthAvailability, setMonthAvailability] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const loadListing = async () => {
    if (!listingId) {
      setLoading(false);
      setError('This outfit is no longer available.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await listingService.getListingById(listingId);
      setListing(response?.data?.listing || null);
    } catch (loadError) {
      setError(bookingErrorMessage(loadError, 'Unable to load this outfit.'));
    } finally {
      setLoading(false);
    }
  };

  const loadCalendar = async (year, month) => {
    if (!listingId) return;
    setCalendarLoading(true);
    try {
      const response = await bookingService.getAvailabilityCalendar(listingId, monthKey(year, month));
      const data = response?.data || {};
      const key = monthKey(year, month);
      setMonthAvailability((current) => ({
        ...current,
        [key]: expandUnavailable(data.blockedDates, data.bookedRanges),
      }));
    } catch (loadError) {
      setFormError(bookingErrorMessage(loadError, 'Unable to load the calendar.'));
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    loadListing();
  }, [listingId]);

  useEffect(() => {
    loadCalendar(cursor.year, cursor.month);
  }, [listingId, cursor.year, cursor.month]);

  const minimumDays = Math.max(1, Number(listing?.rentalDays) || 1);
  const canContinue = Boolean(startDate && endDate && rentalDays(startDate, endDate) >= minimumDays);

  const pastAware = useMemo(() => {
    const dates = new Set();
    Object.values(monthAvailability).forEach((monthDates) => {
      monthDates.forEach((key) => dates.add(key));
    });
    return dates;
  }, [monthAvailability]);

  const onSelect = (key) => {
    setFormError('');
    if (!startDate || (startDate && endDate)) {
      setStartDate(key);
      setEndDate('');
      return;
    }
    if (key < startDate) {
      setStartDate(key);
      setEndDate('');
      return;
    }
    if (rangeHitsUnavailable(startDate, key, pastAware) || rentalDays(startDate, key) < minimumDays) {
      setEndDate('');
      setFormError(rentalDays(startDate, key) < minimumDays
        ? `This outfit requires at least ${minimumDays} rental day${minimumDays === 1 ? '' : 's'}.`
        : 'Some dates in this range are unavailable. Please choose another date range.');
      return;
    }
    setEndDate(key);
  };

  const continueBooking = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    setFormError('');
    try {
      const response = await bookingService.checkAvailability(listingId, startDate, endDate);
      const result = response?.data;
      if (!result?.available) {
        setFormError(result?.reason === 'OWN_PENDING_REQUEST'
          ? 'Your booking request is pending owner approval.'
          : 'Some dates in this range are unavailable. Please choose another date range.');
        loadCalendar(cursor.year, cursor.month);
        return;
      }
      navigation.navigate('CreateBooking', { listingId, startDate, endDate });
    } catch (submitError) {
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
        <Text style={styles.header}>Select dates</Text>
        <View style={styles.back} />
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {!loading && error ? (
        <ErrorState title="Unable to load outfit" message={error} onActionPress={loadListing} />
      ) : null}

      {!loading && listing ? (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>{rupees(listing.price)} / {listing.rentalDuration}</Text>
            <Text style={styles.help}>Select a start date, then a return date. The whole range is checked with Pehenlo.</Text>
            <AvailabilityCalendar
              year={cursor.year}
              month={cursor.month}
              today={today}
              startDate={startDate}
              endDate={endDate}
              unavailable={pastAware}
              loading={calendarLoading}
              onSelect={onSelect}
              onPrevious={() => setCursor((value) => shiftMonth(value.year, value.month, -1))}
              onNext={() => setCursor((value) => shiftMonth(value.year, value.month, 1))}
            />
            <DateRangeSummary startDate={startDate} endDate={endDate} minimumDays={minimumDays} />
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <PrimaryButton
              title="Continue"
              onPress={continueBooking}
              disabled={!canContinue}
              loading={submitting}
              accessibilityLabel="Continue"
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
  price: { ...typography.body, color: colors.primary, marginTop: spacing.xs, marginBottom: spacing.md },
  help: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md },
  formError: { ...typography.body, color: colors.error, marginTop: spacing.md },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});

export default AvailabilityScreen;
