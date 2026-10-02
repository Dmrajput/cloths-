import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const VerifiedRentalBadge = () => (
  <View style={styles.badge} accessibilityLabel="Verified rental">
    <Text style={styles.text}>Verified Rental</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: { ...typography.caption, color: colors.success || '#2E7D5B', fontWeight: '600' },
});

export default VerifiedRentalBadge;
