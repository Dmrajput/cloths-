import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const PaymentMethodInfo = () => (
  <View style={styles.card}>
    <Text style={styles.title}>How you pay</Text>
    <Text style={styles.body}>Razorpay handles UPI, cards, and netbanking. Pehenlo does not store your payment credentials.</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  title: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.xs },
  body: { ...typography.bodySmall, color: colors.textSecondary },
});

export default PaymentMethodInfo;
