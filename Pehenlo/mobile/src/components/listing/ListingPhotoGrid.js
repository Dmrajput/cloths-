import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import ListingPhotoItem from './ListingPhotoItem';

const { colors, typography, spacing, radius } = THEME;

const ListingPhotoGrid = ({
  photos,
  onAdd,
  onRemove,
  onMove,
  onSetCover,
  onRetry,
}) => (
  <View style={styles.grid}>
    {photos.map((photo, index) => (
      <ListingPhotoItem
        key={photo.localUri || photo.url || String(index)}
        photo={photo}
        index={index}
        isCover={index === 0}
        canMoveLeft={index > 0}
        canMoveRight={index < photos.length - 1}
        onRemove={() => onRemove(index)}
        onMoveLeft={() => onMove(index, -1)}
        onMoveRight={() => onMove(index, 1)}
        onSetCover={() => onSetCover(index)}
        onRetry={() => onRetry(index)}
      />
    ))}
    {photos.length < 8 ? (
      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Add photo"
        style={styles.add}
      >
        <Ionicons name="add" size={28} color={colors.primary} />
        <Text style={styles.addText}>Add photo</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  add: {
    width: '31%',
    aspectRatio: 0.8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  addText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});

export default ListingPhotoGrid;
