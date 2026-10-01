import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { getPaymentStatusColor, getPaymentStatusLabel } from '../../utils/paymentHelpers';

const { colors, typography, spacing, radius } = THEME;

const PaymentStatusBadge = ({ status }) => {
  const label = getPaymentStatusLabel(status);
  return (
    <View style={styles.badge} accessibilityLabel={label}>
      <Text style={[styles.text, { color: getPaymentStatusColor(status, colors) }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: { ...typography.caption },
});

export default PaymentStatusBadge;
