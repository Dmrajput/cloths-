import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

function GallerySlide({ uri, width, height, onPress }) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[styles.fallback, { width, height }]}>
        <Ionicons name="image-outline" size={36} color={colors.textMuted} />
        <Text style={styles.fallbackText}>Image unavailable</Text>
      </View>
    );
  }
  const image = (
    <Image
      source={{ uri }}
      style={{ width, height }}
      resizeMode="cover"
      onError={() => setFailed(true)}
      accessibilityLabel="Outfit photo"
    />
  );
  if (!onPress) return image;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Open photo">
      {image}
    </Pressable>
  );
}

const ListingImageGallery = ({ images = [], width, onOpen }) => {
  const photos = images.length ? images : [{ url: '' }];
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const viewerRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const height = Math.round(width * 1.15);
  const viewerHeight = Math.round(windowHeight - insets.top - insets.bottom - 96);

  const onScroll = (event) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const open = () => {
    setViewerOpen(true);
    if (onOpen) onOpen();
  };

  return (
    <View>
      <View>
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          keyExtractor={(item, itemIndex) => item.url || String(itemIndex)}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          renderItem={({ item }) => (
            <GallerySlide uri={item.url} width={width} height={height} onPress={item.url ? open : undefined} />
          )}
          getItemLayout={(_, itemIndex) => ({ length: width, offset: width * itemIndex, index: itemIndex })}
        />
        <View style={styles.counter} accessibilityLabel={`Photo ${index + 1} of ${photos.length}`}>
          <Text style={styles.counterText}>{index + 1} / {photos.length}</Text>
        </View>
      </View>
      {photos.length > 1 ? (
        <View style={styles.dots}>
          {photos.map((photo, dotIndex) => (
            <View key={photo.url || String(dotIndex)} style={[styles.dot, dotIndex === index && styles.dotOn]} />
          ))}
        </View>
      ) : null}
      <Modal visible={viewerOpen} animationType="fade" onRequestClose={() => setViewerOpen(false)}>
        <View style={styles.viewer}>
          <Pressable
            onPress={() => setViewerOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close photos"
            style={[styles.close, { top: insets.top + spacing.sm }]}
          >
            <Ionicons name="close" size={26} color={colors.textLight} />
          </Pressable>
          <FlatList
            ref={viewerRef}
            data={photos}
            horizontal
            pagingEnabled
            initialScrollIndex={Math.min(index, photos.length - 1)}
            keyExtractor={(item, itemIndex) => `full-${item.url || itemIndex}`}
            getItemLayout={(_, itemIndex) => ({ length: width, offset: width * itemIndex, index: itemIndex })}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScroll}
            onScrollToIndexFailed={(info) => {
              viewerRef.current?.scrollToOffset({ offset: width * info.index, animated: false });
            }}
            renderItem={({ item }) => (
              <View style={[styles.viewerSlide, { width }]}>
                <GallerySlide uri={item.url} width={width} height={viewerHeight} />
              </View>
            )}
          />
          <Text style={[styles.viewerCount, { marginBottom: insets.bottom + spacing.lg }]}>{index + 1} / {photos.length}</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  counter: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.overlay,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  counterText: {
    ...typography.caption,
    color: colors.textLight,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotOn: {
    backgroundColor: colors.primary,
    width: 16,
  },
  viewer: {
    flex: 1,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
  },
  viewerSlide: {
    flex: 1,
    justifyContent: 'center',
  },
  close: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 2,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCount: {
    ...typography.label,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
});

export default ListingImageGallery;
