import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import BookingStatusBadge from './BookingStatusBadge';
import { formatDisplayDate, rupees } from '../../utils/bookingHelpers';

const { colors, typography, spacing, radius } = THEME;

const BookingCard = ({ booking, onPress }) => {
  const days = booking.rentalDays;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${booking.outfit?.title || 'Outfit'}, ${BOOKING_LABEL(booking)}`}
      style={styles.card}
    >
      {booking.outfit?.coverImage ? (
        <Image source={{ uri: booking.outfit.coverImage }} style={styles.image} />
      ) : (
        <View style={styles.image} />
      )}
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>{booking.outfit?.title || 'Outfit'}</Text>
        <Text style={styles.meta}>{formatDisplayDate(booking.startDate)} → {formatDisplayDate(booking.endDate)}</Text>
        <Text style={styles.meta}>{days} day{days === 1 ? '' : 's'} · {rupees(booking.totalBeforeDeposit)}</Text>
        <BookingStatusBadge status={booking.status} />
      </View>
    </Pressable>
  );
};

function BOOKING_LABEL(booking) {
  return `${booking.startDate} to ${booking.endDate}`;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  image: {
    width: 84,
    height: 104,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
  },
  copy: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default BookingCard;
