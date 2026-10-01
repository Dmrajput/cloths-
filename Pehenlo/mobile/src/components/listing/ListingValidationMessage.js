import { StyleSheet, Text } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing } = THEME;

const ListingValidationMessage = ({ message }) => {
  if (!message) return null;
  return <Text style={styles.text} accessibilityRole="alert">{message}</Text>;
};

const styles = StyleSheet.create({
  text: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
});

export default ListingValidationMessage;
