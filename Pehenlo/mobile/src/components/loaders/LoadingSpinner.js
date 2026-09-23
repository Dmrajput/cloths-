import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, spacing } = THEME;

const LoadingSpinner = ({
  size = 'large',
  color = colors.primary,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
});

export default LoadingSpinner;
