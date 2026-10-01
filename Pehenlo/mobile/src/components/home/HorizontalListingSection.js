import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { OutfitCard } from '../cards';
import { TextButton } from '../buttons';
import SectionHeader from './SectionHeader';

const { colors, typography, spacing, radius } = THEME;

const CARD_WIDTH = 168;

const ListingSkeleton = () => (
  <View style={styles.skeletonRow}>
    {[0, 1].map((item) => (
      <View key={item} style={styles.skeletonCard}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLineShort} />
      </View>
    ))}
  </View>
);

const HorizontalListingSection = ({
  title,
  listings = [],
  loading = false,
  error = '',
  emptyTitle,
  emptyMessage,
  onRetry,
  onSeeAll,
  onPressListing,
  onFavoritePress,
  isFavorite,
}) => {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} onActionPress={onSeeAll} />
      {loading ? <ListingSkeleton /> : null}
      {!loading && error ? (
        <View style={styles.messageBox}>
          <Text style={styles.message}>{error}</Text>
          {onRetry ? (
            <TextButton title="Retry" onPress={onRetry} accessibilityLabel={`Retry ${title}`} />
          ) : null}
        </View>
      ) : null}
      {!loading && !error && listings.length === 0 ? (
        <View style={styles.messageBox}>
          {emptyTitle ? <Text style={styles.emptyTitle}>{emptyTitle}</Text> : null}
          {emptyMessage ? <Text style={styles.message}>{emptyMessage}</Text> : null}
        </View>
      ) : null}
      {!loading && !error && listings.length > 0 ? (
        <FlatList
          horizontal
          data={listings}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <OutfitCard
              image={item.coverImage}
              title={item.title}
              price={item.price}
              duration={item.rentalDuration}
              rating={item.rating}
              location={item.city}
              isFavorite={isFavorite?.(item.id)}
              onPress={() => onPressListing(item)}
              onFavoritePress={() => onFavoritePress(item.id)}
              style={styles.card}
            />
          )}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
  },
  messageBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
  },
  skeletonRow: {
    flexDirection: 'row',
  },
  skeletonCard: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 180,
    backgroundColor: colors.surfaceSecondary,
  },
  skeletonLine: {
    height: 12,
    margin: spacing.md,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceSecondary,
  },
  skeletonLineShort: {
    height: 12,
    width: '50%',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceSecondary,
  },
});

export default HorizontalListingSection;
