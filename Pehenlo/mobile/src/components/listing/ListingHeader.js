import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing } = THEME;

const ListingHeader = ({
  title,
  rating,
  reviewCount,
  city,
  state,
  onCityPress,
}) => {
  const hasReviews = Number(reviewCount) > 0 && Number(rating) > 0;
  const place = [city, state].filter(Boolean).join(', ');

  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.rating} accessibilityLabel={hasReviews ? `Rating ${rating}, ${reviewCount} reviews` : 'No reviews yet'}>
        {hasReviews ? `★ ${Number(rating).toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? '' : 's'}` : 'No reviews yet'}
      </Text>
      {place ? (
        <Pressable onPress={onCityPress} disabled={!onCityPress} accessibilityRole="button" accessibilityLabel={`Location ${place}`} style={styles.location}>
          <Ionicons name="location-outline" size={16} color={colors.primary} />
          <Text style={styles.locationText}>{place}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  rating: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    minHeight: 44,
  },
  locationText: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
});

export default ListingHeader;
