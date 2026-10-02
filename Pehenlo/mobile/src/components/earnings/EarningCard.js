import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { rupees, formatDisplayDate } from '../../utils/bookingHelpers';
import EarningStatusBadge from './EarningStatusBadge';

const { colors, typography, spacing, radius } = THEME;

const EarningCard = ({ earning, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${earning.outfitTitle}. You earned ${rupees(earning.netEarning)}`}
    style={styles.card}
  >
    <View style={styles.row}>
      {earning.coverImage ? <Image source={{ uri: earning.coverImage }} style={styles.image} /> : <View style={styles.image} />}
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>{earning.outfitTitle}</Text>
        <Text style={styles.meta}>{formatDisplayDate(earning.startDate)} – {formatDisplayDate(earning.endDate)}</Text>
        {earning.bookingReference ? <Text style={styles.meta}>{earning.bookingReference}</Text> : null}
      </View>
    </View>
    <View style={styles.line}>
      <Text style={styles.label}>Gross</Text>
      <Text style={styles.value}>{rupees(earning.grossRentalAmount)}</Text>
    </View>
    <View style={styles.line}>
      <Text style={styles.label}>Pehenlo fee</Text>
      <Text style={styles.value}>-{rupees(earning.commissionAmount)}</Text>
    </View>
    <View style={styles.line}>
      <Text style={styles.earned}>You earned</Text>
      <Text style={styles.earned}>{rupees(earning.netEarning)}</Text>
    </View>
    <Text style={styles.deposit}>Security deposit {rupees(earning.securityDeposit)} is not included</Text>
    <EarningStatusBadge status={earning.status} />
    <Text style={styles.link}>View details</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', marginBottom: spacing.sm },
  image: { width: 64, height: 80, borderRadius: radius.sm, backgroundColor: colors.surfaceSecondary },
  copy: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.label, color: colors.textPrimary },
  meta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  line: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  label: { ...typography.bodySmall, color: colors.textSecondary },
  value: { ...typography.bodySmall, color: colors.textPrimary },
  earned: { ...typography.label, color: colors.primary, marginTop: spacing.xs },
  deposit: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.sm },
  link: { ...typography.label, color: colors.primary, marginTop: spacing.sm },
});

export default EarningCard;
