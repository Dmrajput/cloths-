import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import IconButton from '../buttons/IconButton';
import PriceText from '../common/PriceText';
import Rating from '../common/Rating';

const { colors, typography, spacing, radius, shadows } = THEME;

const OutfitCard = ({
  image,
  title,
  price,
  duration,
  rating,
  distance,
  isFavorite = false,
  onPress,
  onFavoritePress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="shirt-outline" size={36} color={colors.textMuted} />
          </View>
        )}

        <IconButton
          name={isFavorite ? 'heart' : 'heart-outline'}
          onPress={onFavoritePress}
          size={20}
          color={isFavorite ? colors.primary : colors.textPrimary}
          backgroundColor="rgba(255,255,255,0.92)"
          style={styles.favoriteButton}
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          {rating != null ? <Rating value={rating} size={14} /> : null}
          {distance ? (
            <View style={styles.distanceRow}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={styles.distance}>{distance}</Text>
            </View>
          ) : null}
        </View>

        {price != null ? (
          <PriceText price={price} duration={duration} style={styles.price} />
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.small,
  },
  pressed: {
    opacity: 0.92,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: colors.surfaceSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distance: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  price: {
    marginTop: spacing.xs,
  },
});

export default OutfitCard;
