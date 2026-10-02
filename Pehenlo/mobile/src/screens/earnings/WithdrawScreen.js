import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { earningsService } from '../../services/earningsService';
import { rupees } from '../../utils/bookingHelpers';
import { earningErrorMessage, parseRupeeInput } from '../../utils/earningHelpers';

const { colors, typography, spacing, radius } = THEME;
const QUICK = [500, 1000, 5000];

const WithdrawScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [available, setAvailable] = useState(0);
  const [minimum, setMinimum] = useState(500);
  const [account, setAccount] = useState(null);
  const [amountText, setAmountText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const [summary, accountResponse] = await Promise.all([
        earningsService.getSummary(),
        earningsService.getPayoutAccount(),
      ]);
      setAvailable(summary?.data?.availableAmount || 0);
      setMinimum(summary?.data?.minimumPayoutAmount || 500);
      setAccount(accountResponse?.data?.account || null);
    } catch (error) {
      setMessage(earningErrorMessage(error, 'Unable to load your balance.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const amount = parseRupeeInput(amountText);

  const submit = () => {
    if (!account) {
      navigation.navigate('PayoutAccount');
      return;
    }
    if (!Number.isInteger(amount) || amount < 1) {
      setMessage('Enter an amount in whole rupees.');
      return;
    }
    if (amount > available) {
      setMessage('That amount is more than your available balance.');
      return;
    }
    Alert.alert('Request payout?', `Amount ${rupees(amount)}\nAccount ${account.maskedAccountNumber}\n\nPayout processing is not yet automated.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Request Payout',
        onPress: async () => {
          setSubmitting(true);
          setMessage('');
          try {
            const response = await earningsService.requestPayout(amount);
            setSubmitted(response?.data?.payout || { status: 'REQUESTED', amount });
          } catch (error) {
            setMessage(earningErrorMessage(error));
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.header}>Withdraw earnings</Text>
        <View style={styles.back} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Available</Text>
        <Text style={styles.balance}>{rupees(available)}</Text>
        {submitted ? (
          <View style={styles.card}>
            <Text style={styles.title}>Payout request submitted</Text>
            <Text style={styles.body}>Amount {rupees(submitted.amount)}</Text>
            <Text style={styles.body}>Status {submitted.status || 'REQUESTED'}</Text>
            <Text style={styles.note}>Payout processing is not yet automated. This request is not a completed bank transfer.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              value={amountText}
              onChangeText={setAmountText}
              keyboardType="number-pad"
              placeholder="₹"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Payout amount"
              style={styles.input}
            />
            <View style={styles.quick}>
              {QUICK.map((value) => (
                <Pressable key={value} onPress={() => setAmountText(String(value))} style={styles.chip} accessibilityRole="button" accessibilityLabel={`Rupees ${value}`}>
                  <Text style={styles.chipText}>{rupees(value)}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => setAmountText(String(available || 0))} style={styles.chip} accessibilityRole="button" accessibilityLabel="Maximum amount">
                <Text style={styles.chipText}>Max</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>Minimum payout {rupees(minimum)}</Text>
            <Pressable onPress={() => navigation.navigate('PayoutAccount')} accessibilityRole="button" style={styles.account}>
              <Text style={styles.label}>Payout account</Text>
              <Text style={styles.body}>{account ? account.maskedAccountNumber : 'Set up payout account'}</Text>
            </Pressable>
            {message ? <Text style={styles.error}>{message}</Text> : null}
            <PrimaryButton
              title={account ? 'Request Payout' : 'Set Up Payout Account'}
              onPress={submit}
              loading={submitting || loading}
              accessibilityLabel={account ? 'Request payout' : 'Set up payout account'}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.sm },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { ...typography.h2, color: colors.textPrimary },
  header: { ...typography.h3, color: colors.textPrimary },
  content: { padding: spacing.lg },
  label: { ...typography.caption, color: colors.textSecondary },
  balance: { ...typography.h1, color: colors.primary, marginBottom: spacing.lg },
  input: {
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  chip: { minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.round, backgroundColor: colors.surface, justifyContent: 'center' },
  chipText: { ...typography.label, color: colors.textPrimary },
  note: { ...typography.bodySmall, color: colors.textMuted, marginVertical: spacing.md },
  account: { minHeight: 44, marginBottom: spacing.md },
  body: { ...typography.body, color: colors.textPrimary, marginTop: spacing.xs },
  error: { ...typography.body, color: colors.error, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  title: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
});

export default WithdrawScreen;
