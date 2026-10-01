import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import PrimaryButton from '../buttons/PrimaryButton';

const { colors, typography, spacing } = THEME;

function rupees(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

const StickyListingCTA = ({ price, durationLabel, isOwner, onPress }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <Text style={styles.price}>{rupees(price)} / {durationLabel}</Text>
      {isOwner ? (
        <Text style={styles.owner} accessibilityLabel="Your listing">Your listing</Text>
      ) : (
        <PrimaryButton title="Check Availability" onPress={onPress} accessibilityLabel="Check availability" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  price: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  owner: {
    ...typography.h3,
    color: colors.primary,
    minHeight: 48,
    textAlignVertical: 'center',
  },
});

export default StickyListingCTA;
