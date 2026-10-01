import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import BookingStatusBadge from './BookingStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import { rupees } from '../../utils/bookingHelpers';
import {
  fulfillmentLabel,
  rentalAttention,
  rentalDateLabel,
} from '../../utils/rentalHelpers';

const { colors, typography, spacing, radius } = THEME;

const RentalCard = ({ booking, onPress, footer }) => {
  const days = booking.rentalDays;
  const attention = rentalAttention(booking);
  const personName = booking.role === 'owner' ? booking.renter?.name : booking.owner?.name;
  return (
    <View style={styles.card}>
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${booking.outfit?.title || 'Outfit'}. ${rentalDateLabel(booking)}. View booking.`}
    >
      <View style={styles.row}>
        {booking.outfit?.coverImage ? (
          <Image source={{ uri: booking.outfit.coverImage }} style={styles.image} accessibilityLabel={booking.outfit.title} />
        ) : (
          <View style={styles.image} />
        )}
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>{booking.outfit?.title || 'Outfit'}</Text>
          <Text style={styles.meta}>{rentalDateLabel(booking)}</Text>
          <Text style={styles.meta}>{days} day{days === 1 ? '' : 's'}</Text>
          {personName ? <Text style={styles.meta}>{booking.role === 'owner' ? 'Renter' : 'Owner'} {personName}</Text> : null}
          {booking.outfit?.city ? <Text style={styles.meta}>{booking.outfit.city}</Text> : null}
        </View>
      </View>
      <Text style={styles.money}>{rupees(booking.totalBeforeDeposit)} rental</Text>
      <Text style={styles.deposit}>{rupees(booking.securityDeposit)} refundable deposit</Text>
      <View style={styles.badges}>
        <BookingStatusBadge status={booking.status} />
        <PaymentStatusBadge status={booking.paymentStatus} />
      </View>
      <Text style={styles.meta}>{fulfillmentLabel(booking.fulfillmentMethod)}</Text>
      {attention ? <Text style={styles.attention}>{attention}</Text> : null}
      {booking.bookingReference ? <Text style={styles.reference}>{booking.bookingReference}</Text> : null}
      <Text style={styles.link}>View booking</Text>
    </Pressable>
    {footer}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row' },
  image: {
    width: 84,
    height: 104,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
  },
  copy: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.label, color: colors.textPrimary },
  meta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  money: { ...typography.label, color: colors.textPrimary, marginTop: spacing.md },
  deposit: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  attention: { ...typography.body, color: colors.textPrimary, marginTop: spacing.sm },
  reference: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  link: { ...typography.label, color: colors.primary, marginTop: spacing.sm },
});

export default RentalCard;
