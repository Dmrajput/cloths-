import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../../constants/theme';
import {
  conditionLabel,
  genderLabel,
} from '../../../constants/exploreConstants';
import { formatPriceChip } from '../../../utils/listingQuery';

const { colors, typography, spacing, radius } = THEME;

const Chip = ({ label, onRemove }) => (
  <Pressable
    onPress={onRemove}
    accessibilityRole="button"
    accessibilityLabel={`Remove ${label} filter`}
    style={styles.chip}
  >
    <Text style={styles.chipText}>{label}</Text>
    <Ionicons name="close" size={14} color={colors.primary} />
  </Pressable>
);

const ActiveFilterChips = ({
  filters,
  categoryName,
  onRemoveCategory,
  onRemoveGender,
  onRemovePrice,
  onRemoveSize,
  onRemoveCondition,
  onRemoveRating,
  onRemoveCity,
  onRemoveOccasion,
  onRemoveSource,
  onClearAll,
}) => {
  const chips = [];

  (filters.category || []).forEach((slug) => {
    chips.push({
      key: `category-${slug}`,
      label: categoryName(slug),
      onRemove: () => onRemoveCategory(slug),
    });
  });

  if (filters.gender) {
    chips.push({
      key: 'gender',
      label: genderLabel(filters.gender),
      onRemove: onRemoveGender,
    });
  }

  const priceLabel = formatPriceChip(filters.minPrice, filters.maxPrice);
  if (priceLabel) {
    chips.push({ key: 'price', label: priceLabel, onRemove: onRemovePrice });
  }

  (filters.size || []).forEach((size) => {
    chips.push({
      key: `size-${size}`,
      label: size,
      onRemove: () => onRemoveSize(size),
    });
  });

  (filters.condition || []).forEach((condition) => {
    chips.push({
      key: `condition-${condition}`,
      label: conditionLabel(condition),
      onRemove: () => onRemoveCondition(condition),
    });
  });

  if (filters.minRating != null) {
    chips.push({
      key: 'rating',
      label: `${filters.minRating}★ & above`,
      onRemove: onRemoveRating,
    });
  }

  if (filters.city) {
    chips.push({ key: 'city', label: filters.city, onRemove: onRemoveCity });
  }

  if (filters.occasion) {
    chips.push({
      key: 'occasion',
      label: filters.occasion.replace(/-/g, ' '),
      onRemove: onRemoveOccasion,
    });
  }

  if (filters.source === 'featured') {
    chips.push({ key: 'source', label: 'Featured', onRemove: onRemoveSource });
  }

  if (!chips.length) return null;

  return (
    <View style={styles.row}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {chips.map((chip) => (
          <Chip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
        ))}
        <Pressable
          onPress={onClearAll}
          accessibilityRole="button"
          accessibilityLabel="Clear all filters"
          style={styles.clear}
        >
          <Text style={styles.clearText}>Clear all</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginTop: spacing.sm,
  },
  scroll: {
    alignItems: 'center',
    paddingRight: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    minHeight: 36,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  chipText: {
    ...typography.label,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  clear: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  clearText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});

export default ActiveFilterChips;
