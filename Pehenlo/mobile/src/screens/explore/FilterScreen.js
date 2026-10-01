import { useEffect, useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import {
  CITY_OPTIONS,
  CONDITION_OPTIONS,
  GENDER_OPTIONS,
  RATING_OPTIONS,
  SIZE_OPTIONS,
  emptyFilters,
} from '../../constants/exploreConstants';
import { ScreenContainer } from '../../components/common';
import { PrimaryButton, TextButton } from '../../components/buttons';
import { listingService } from '../../services/listingService';
import { cloneFilters } from '../../utils/listingQuery';
import FilterSection from './components/FilterSection';

const { colors, typography, spacing, radius } = THEME;

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

const Choice = ({ label, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ selected }}
    style={[styles.choice, selected && styles.choiceSelected]}
  >
    <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
  </Pressable>
);

const FilterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [draft, setDraft] = useState(() => cloneFilters(route.params?.filters));
  const [minText, setMinText] = useState(draft.minPrice != null ? String(draft.minPrice) : '');
  const [maxText, setMaxText] = useState(draft.maxPrice != null ? String(draft.maxPrice) : '');
  const [priceError, setPriceError] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    listingService.getCategories()
      .then((response) => {
        if (active) setCategories(response?.data?.categories || []);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const reset = () => {
    setDraft(emptyFilters());
    setMinText('');
    setMaxText('');
    setPriceError('');
  };

  const apply = () => {
    const minPrice = minText.trim() === '' ? null : Number(minText);
    const maxPrice = maxText.trim() === '' ? null : Number(maxText);
    const minInvalid = minText.trim() !== '' && (!/^\d+$/.test(minText.trim()) || minPrice < 0);
    const maxInvalid = maxText.trim() !== '' && (!/^\d+$/.test(maxText.trim()) || maxPrice < 0);
    if (minInvalid || maxInvalid) {
      setPriceError('Enter a price of 0 or more.');
      return;
    }
    if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
      setPriceError('Minimum price cannot be greater than maximum price.');
      return;
    }

    navigation.navigate('MainTabs', {
      screen: 'Explore',
      params: {
        filterToken: Date.now(),
        filters: { ...draft, minPrice, maxPrice },
        sort: route.params?.sort || 'recommended',
        search: route.params?.search || '',
      },
    }, { merge: false });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TextButton title="Reset" onPress={reset} accessibilityLabel="Reset filters" />
      ),
    });
  }, [navigation, draft, minText, maxText]);

  return (
    <ScreenContainer scroll edges={['bottom']}>
      <FilterSection title="Category">
        {categories.map((category) => (
          <Choice
            key={category.slug}
            label={category.name}
            selected={draft.category.includes(category.slug)}
            onPress={() => setDraft((current) => ({
              ...current,
              category: toggleValue(current.category, category.slug),
            }))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Gender">
        {GENDER_OPTIONS.map((option) => (
          <Choice
            key={option.value}
            label={option.label}
            selected={draft.gender === option.value}
            onPress={() => setDraft((current) => ({
              ...current,
              gender: current.gender === option.value ? null : option.value,
            }))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Price Range">
        <View style={styles.priceRow}>
          <TextInput
            value={minText}
            onChangeText={(text) => {
              setMinText(text.replace(/[^\d]/g, ''));
              setPriceError('');
            }}
            keyboardType="number-pad"
            placeholder="Min ₹"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Minimum price"
            style={styles.priceInput}
          />
          <TextInput
            value={maxText}
            onChangeText={(text) => {
              setMaxText(text.replace(/[^\d]/g, ''));
              setPriceError('');
            }}
            keyboardType="number-pad"
            placeholder="Max ₹"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Maximum price"
            style={styles.priceInput}
          />
        </View>
        {priceError ? <Text style={styles.priceError}>{priceError}</Text> : null}
      </FilterSection>

      <FilterSection title="Size">
        {SIZE_OPTIONS.map((size) => (
          <Choice
            key={size}
            label={size}
            selected={draft.size.includes(size)}
            onPress={() => setDraft((current) => ({
              ...current,
              size: toggleValue(current.size, size),
            }))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Condition">
        {CONDITION_OPTIONS.map((option) => (
          <Choice
            key={option.value}
            label={option.label}
            selected={draft.condition.includes(option.value)}
            onPress={() => setDraft((current) => ({
              ...current,
              condition: toggleValue(current.condition, option.value),
            }))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Rating">
        {RATING_OPTIONS.map((option) => (
          <Choice
            key={option.value}
            label={option.label}
            selected={draft.minRating === option.value}
            onPress={() => setDraft((current) => ({
              ...current,
              minRating: current.minRating === option.value ? null : option.value,
            }))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Location">
        {CITY_OPTIONS.map((city) => (
          <Choice
            key={city}
            label={city}
            selected={draft.city === city}
            onPress={() => setDraft((current) => ({
              ...current,
              city: current.city === city ? null : city,
            }))}
          />
        ))}
      </FilterSection>

      <PrimaryButton title="Apply Filters" onPress={apply} accessibilityLabel="Apply filters" />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    minHeight: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  choiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  choiceText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  choiceTextSelected: {
    color: colors.textLight,
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  priceInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  priceError: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.sm,
    width: '100%',
  },
});

export default FilterScreen;
