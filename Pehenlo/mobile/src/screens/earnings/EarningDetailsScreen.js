import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { earningsService } from '../../services/earningsService';
import { ErrorState } from '../../components/common';
import EarningStatusBadge from '../../components/earnings/EarningStatusBadge';
import { formatDisplayDate, rupees } from '../../utils/bookingHelpers';
import { earningErrorMessage } from '../../utils/earningHelpers';
import { formatEventTime } from '../../utils/rentalHelpers';

const { colors, typography, spacing, radius } = THEME;

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const EarningDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const earningId = route.params?.earningId;
  const [earning, setEarning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!earningId) {
      setLoading(false);
      setError('This earning could not be found.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await earningsService.getEarning(earningId);
      setEarning(response?.data?.earning || null);
    } catch (loadError) {
      setError(earningErrorMessage(loadError, 'Unable to load this earning.'));
    } finally {
      setLoading(false);
    }
  }, [earningId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.header}>Earning</Text>
        <View style={styles.back} />
      </View>
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {!loading && error ? <ErrorState title="Unable to load earning" message={error} onActionPress={load} /> : null}
      {!loading && earning ? (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
          <Text style={styles.title}>{earning.outfitTitle}</Text>
          <Text style={styles.meta}>{earning.bookingReference}</Text>
          <Text style={styles.meta}>{formatDisplayDate(earning.startDate)} – {formatDisplayDate(earning.endDate)}</Text>
          <EarningStatusBadge status={earning.status} />
          <Text style={styles.section}>Customer payment</Text>
          <View style={styles.card}>
            <Row label="Rental" value={rupees(earning.rentalSubtotal)} />
            <Row label="Cleaning" value={rupees(earning.cleaningFee)} />
            <Row label="Delivery" value={rupees(earning.deliveryFee)} />
            <Row label="Platform fee" value={rupees(earning.platformFee)} />
            <Row label="Security deposit" value={rupees(earning.securityDeposit)} />
            <Row label="Total paid by renter" value={rupees(earning.customerTotal)} />
          </View>
          <Text style={styles.section}>Seller earning</Text>
          <View style={styles.card}>
            <Row label="Gross rental" value={rupees(earning.grossRentalAmount)} />
            <Row label="Pehenlo commission" value={`-${rupees(earning.commissionAmount)}`} />
            <Row label="Net earning" value={rupees(earning.netEarning)} />
            <Text style={styles.note}>Security deposit {rupees(earning.securityDeposit)} is not seller earnings.</Text>
          </View>
          {earning.availableAt ? <Text style={styles.meta}>Available from {formatEventTime(earning.availableAt)}</Text> : null}
          {earning.paidAt ? <Text style={styles.meta}>Paid {formatEventTime(earning.paidAt)}</Text> : null}
          {earning.payoutReference ? <Text style={styles.meta}>Payout {earning.payoutReference}</Text> : null}
          {earning.bookingId ? (
            <Pressable onPress={() => navigation.navigate('BookingDetails', { bookingId: earning.bookingId })} accessibilityRole="button" style={styles.linkWrap}>
              <Text style={styles.link}>View booking</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.sm },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { ...typography.h2, color: colors.textPrimary },
  header: { ...typography.h3, color: colors.textPrimary },
  loader: { marginTop: spacing.xl },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary },
  meta: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  section: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  label: { ...typography.body, color: colors.textSecondary, flex: 1, marginRight: spacing.sm },
  value: { ...typography.label, color: colors.textPrimary },
  note: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.xs },
  linkWrap: { minHeight: 44, justifyContent: 'center', marginTop: spacing.lg },
  link: { ...typography.label, color: colors.primary },
});

export default EarningDetailsScreen;
