import { StyleSheet, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, spacing } = THEME;

const Divider = ({ style, spacing: spacingProp = 'md' }) => {
  const marginVertical =
    typeof spacingProp === 'number' ? spacingProp : spacing[spacingProp] ?? spacing.md;

  return (
    <View
      style={[styles.divider, { marginVertical }, style]}
      accessibilityRole="none"
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    alignSelf: 'stretch',
  },
});

export default Divider;
