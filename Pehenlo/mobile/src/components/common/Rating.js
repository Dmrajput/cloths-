import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing } = THEME;

const Rating = ({ value = 0, showValue = true, size = 14, style }) => {
  const displayValue = Number(value).toFixed(1).replace(/\.0$/, '');

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="text"
      accessibilityLabel={`Rating ${displayValue} out of 5`}
    >
      <Ionicons name="star" size={size} color={colors.secondary} />
      {showValue ? (
        <Text style={[styles.value, { fontSize: size, marginLeft: spacing.xs }]}>
          {displayValue}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    ...typography.label,
    color: colors.textPrimary,
  },
});

export default Rating;
