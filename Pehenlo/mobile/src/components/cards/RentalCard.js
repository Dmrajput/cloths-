import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius, shadows } = THEME;

const STATUS_COLORS = {
  active: colors.success,
  pending: colors.warning,
  completed: colors.textMuted,
  cancelled: colors.error,
};

const RentalCard = ({
  title,
  status,
  dateRange,
  image,
  price,
  onPress,
  style,
}) => {
  const statusColor = STATUS_COLORS[status?.toLowerCase()] || colors.info;

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
            <Ionicons name="shirt-outline" size={24} color={colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {status ? (
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status}
              </Text>
            </View>
          ) : null}
        </View>

        {dateRange ? (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={styles.dateRange}>{dateRange}</Text>
          </View>
        ) : null}

        {price != null ? (
          <Text style={styles.price}>₹{price}</Text>
        ) : null}
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.textMuted}
        style={styles.chevron}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.small,
  },
  pressed: {
    opacity: 0.92,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    overflow: 'hidden',
    marginRight: spacing.md,
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
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateRange: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  price: {
    ...typography.price,
    color: colors.primary,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});

export default RentalCard;
