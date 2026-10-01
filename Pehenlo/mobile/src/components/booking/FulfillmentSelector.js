import { Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { FULFILLMENT } from '../../constants/bookingConstants';

const { colors, typography, spacing, radius } = THEME;

const FulfillmentSelector = ({
  pickupAvailable,
  deliveryAvailable,
  value,
  onChange,
}) => {
  const options = [
    pickupAvailable ? { id: FULFILLMENT.PICKUP, label: 'Pickup' } : null,
    deliveryAvailable ? { id: FULFILLMENT.DELIVERY, label: 'Delivery' } : null,
  ].filter(Boolean);

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.text, selected && styles.selectedText]}>{selected ? '● ' : '○ '}{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  option: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  text: {
    ...typography.label,
    color: colors.textPrimary,
  },
  selectedText: {
    color: colors.textLight,
  },
});

export default FulfillmentSelector;
