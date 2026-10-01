import { Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { CONDITION_OPTIONS } from '../../constants/listingConstants';

const { colors, typography, spacing, radius } = THEME;

const ConditionSelector = ({ value, onChange }) => (
  <View style={styles.row}>
    {CONDITION_OPTIONS.map((option) => {
      const selected = value === option.value;
      return (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          accessibilityRole="button"
          accessibilityLabel={option.label}
          accessibilityState={{ selected }}
          style={[styles.chip, selected && styles.chipSelected]}
        >
          <Text style={[styles.text, selected && styles.textSelected]}>{option.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    ...typography.label,
    color: colors.textPrimary,
  },
  textSelected: {
    color: colors.textLight,
  },
});

export default ConditionSelector;
