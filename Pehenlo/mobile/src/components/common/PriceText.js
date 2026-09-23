import { StyleSheet, Text } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography } = THEME;

/**
 * Displays a Pehenlo price line, e.g. ₹1,499 / 2 days
 */
const PriceText = ({
  amount,
  price,
  suffix,
  duration,
  prefix = '₹',
  style,
}) => {
  const raw = amount ?? price ?? 0;
  const formattedAmount =
    typeof raw === 'string'
      ? raw.replace(/^₹\s*/, '')
      : Number(raw || 0).toLocaleString('en-IN');

  const endSuffix = suffix || (duration ? `/ ${duration}` : '');
  const text = `${prefix}${formattedAmount}${endSuffix ? ` ${endSuffix}` : ''}`;

  return (
    <Text
      style={[styles.price, style]}
      accessibilityRole="text"
      accessibilityLabel={`Price ${text}`}
    >
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  price: {
    ...typography.price,
    color: colors.primary,
  },
});

export default PriceText;
