import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { earningsService } from '../../services/earningsService';
import { earningErrorMessage } from '../../utils/earningHelpers';

const { colors, typography, spacing, radius } = THEME;

const Field = ({ label, value, onChangeText, keyboardType = 'default', autoCapitalize = 'words' }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      accessibilityLabel={label}
      style={styles.input}
    />
  </View>
);

const PayoutAccountScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [accountId, setAccountId] = useState('');
  const [holder, setHolder] = useState('');
  const [bank, setBank] = useState('');
  const [number, setNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await earningsService.getPayoutAccount();
      const account = response?.data?.account;
      if (!account) return;
      setAccountId(account.id);
      setHolder(account.accountHolderName || '');
      setBank(account.bankName || '');
      setIfsc(account.ifsc || '');
      setSaved(account);
    } catch (error) {
      setMessage(earningErrorMessage(error, 'Unable to load the payout account.'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setLoading(true);
    setMessage('');
    try {
      const body = {
        accountHolderName: holder.trim(),
        bankName: bank.trim(),
        accountNumber: number.replace(/\D/g, ''),
        ifsc: ifsc.trim().toUpperCase(),
      };
      const response = accountId
        ? await earningsService.updatePayoutAccount(accountId, body)
        : await earningsService.savePayoutAccount(body);
      const account = response?.data?.account;
      setSaved(account);
      setAccountId(account?.id || accountId);
      setNumber('');
      setMessage('Payout account saved. Bank verification has not been completed.');
    } catch (error) {
      setMessage(earningErrorMessage(error, 'Unable to save the payout account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.header}>Payout account</Text>
        <View style={styles.back} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {saved ? <Text style={styles.note}>Saved account {saved.maskedAccountNumber}. Status: {saved.status.split('_').join(' ').toLowerCase()}.</Text> : null}
        <Field label="Account holder name" value={holder} onChangeText={setHolder} />
        <Field label="Bank name" value={bank} onChangeText={setBank} />
        <Field label="Account number" value={number} onChangeText={setNumber} keyboardType="number-pad" autoCapitalize="none" />
        <Field label="IFSC" value={ifsc} onChangeText={setIfsc} autoCapitalize="characters" />
        <Text style={styles.note}>Pehenlo stores this for a future payout provider. It is not marked verified until a provider confirms it.</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <PrimaryButton title={accountId ? 'Update account' : 'Save account'} onPress={save} loading={loading} accessibilityLabel="Save payout account" />
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
  field: { marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  note: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },
  message: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.md },
});

export default PayoutAccountScreen;
