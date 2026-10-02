import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { ErrorState } from '../../components/common';
import EarningStatusBadge from '../../components/earnings/EarningStatusBadge';
import { earningsService } from '../../services/earningsService';
import { rupees } from '../../utils/bookingHelpers';
import { earningErrorMessage } from '../../utils/earningHelpers';
import { formatEventTime } from '../../utils/rentalHelpers';

const { colors, typography, spacing } = THEME;

const PayoutDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const payoutId = route.params?.payoutId;
  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!payoutId) {
      setLoading(false);
      setError('This payout could not be found.');
      return;
    }
    setError('');
    try {
      const response = await earningsService.getPayout(payoutId);
      setPayout(response?.data?.payout || null);
    } catch (loadError) {
      setError(earningErrorMessage(loadError, 'Unable to load this payout.'));
    } finally {
      setLoading(false);
    }
  }, [payoutId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top, padding: spacing.lg }]}>
      <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
        <Text style={styles.backText}>←</Text>
      </Pressable>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {!loading && error ? <ErrorState title="Unable to load payout" message={error} onActionPress={load} /> : null}
      {!loading && payout ? (
        <View>
          <Text style={styles.title}>{payout.payoutReference}</Text>
          <Text style={styles.amount}>{rupees(payout.amount)}</Text>
          <EarningStatusBadge status={payout.status} kind="payout" />
          <Text style={styles.meta}>Requested {formatEventTime(payout.requestedAt)}</Text>
          {payout.processedAt ? <Text style={styles.meta}>Processed {formatEventTime(payout.processedAt)}</Text> : null}
          {payout.paidAt ? <Text style={styles.meta}>Paid {formatEventTime(payout.paidAt)}</Text> : null}
          <Text style={styles.meta}>Method {payout.payoutMethod}</Text>
          {payout.account ? <Text style={styles.meta}>{payout.account.bankName} {payout.account.maskedAccountNumber}</Text> : null}
          {payout.failureReason ? <Text style={styles.error}>{payout.failureReason}</Text> : null}
          {payout.status === 'REQUESTED' ? (
            <Text style={styles.note}>Payout processing is not yet automated. A requested payout is not a completed transfer.</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backText: { ...typography.h2, color: colors.textPrimary },
  title: { ...typography.h3, color: colors.textPrimary },
  amount: { ...typography.h1, color: colors.primary, marginVertical: spacing.sm },
  meta: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  error: { ...typography.body, color: colors.error, marginTop: spacing.md },
  note: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.lg },
});

export default PayoutDetailsScreen;
