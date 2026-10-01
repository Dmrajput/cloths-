import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const ListingPhotoItem = ({
  photo,
  isCover,
  canMoveLeft,
  canMoveRight,
  onRemove,
  onMoveLeft,
  onMoveRight,
  onSetCover,
  onRetry,
}) => (
  <View style={styles.card}>
    <Image source={{ uri: photo.localUri || photo.url }} style={styles.image} />
    {isCover ? <Text style={styles.cover}>Cover</Text> : null}
    {photo.uploading ? <Text style={styles.status}>Uploading...</Text> : null}
    {photo.error ? (
      <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Retry photo upload" style={styles.statusButton}>
        <Text style={styles.error}>Retry</Text>
      </Pressable>
    ) : null}
    <View style={styles.actions}>
      <Pressable onPress={onMoveLeft} disabled={!canMoveLeft} accessibilityRole="button" accessibilityLabel="Move photo left" style={styles.icon}>
        <Ionicons name="chevron-back" size={16} color={canMoveLeft ? colors.textPrimary : colors.disabled} />
      </Pressable>
      {!isCover ? (
        <Pressable onPress={onSetCover} accessibilityRole="button" accessibilityLabel="Set as cover image" style={styles.icon}>
          <Ionicons name="star-outline" size={16} color={colors.secondary} />
        </Pressable>
      ) : null}
      <Pressable onPress={onMoveRight} disabled={!canMoveRight} accessibilityRole="button" accessibilityLabel="Move photo right" style={styles.icon}>
        <Ionicons name="chevron-forward" size={16} color={canMoveRight ? colors.textPrimary : colors.disabled} />
      </Pressable>
      <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel="Delete photo" style={styles.icon}>
        <Ionicons name="trash-outline" size={16} color={colors.error} />
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 0.8,
    backgroundColor: colors.surfaceSecondary,
  },
  cover: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primary,
    color: colors.textLight,
    ...typography.caption,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.xs,
    overflow: 'hidden',
  },
  status: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  statusButton: {
    minHeight: 32,
    justifyContent: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    minWidth: 28,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ListingPhotoItem;
