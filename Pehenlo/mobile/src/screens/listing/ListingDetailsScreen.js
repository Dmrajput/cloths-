import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import {
  COLOR_OPTIONS,
  GENDER_OPTIONS,
  OCCASION_OPTIONS,
} from '../../constants/listingConstants';
import ListingWizard from '../../components/listing/ListingWizard';
import ListingFormSection from '../../components/listing/ListingFormSection';
import ListingValidationMessage from '../../components/listing/ListingValidationMessage';
import { AppInput, AppTextArea } from '../../components/inputs';
import { listingService } from '../../services/listingService';
import { useListingDraft } from '../../context/ListingDraftContext';
import { validateListingDetails } from '../../utils/listingValidation';

const { colors, typography, spacing, radius } = THEME;

const Chip = ({ label, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ selected }}
    style={[styles.chip, selected && styles.chipOn]}
  >
    <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
  </Pressable>
);

const ListingDetailsScreen = () => {
  const navigation = useNavigation();
  const { activeDraft, updateDraft, syncDraft } = useListingDraft();
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [customColor, setCustomColor] = useState(
    activeDraft?.color && !COLOR_OPTIONS.includes(activeDraft.color)
  );
  const draft = activeDraft || {};

  useEffect(() => {
    listingService.getCategories()
      .then((response) => setCategories(response?.data?.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const patch = (next) => updateDraft(next);

  const toggleOccasion = (value) => {
    const current = draft.occasion || [];
    const occasion = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    patch({ occasion });
  };

  const continueStep = async () => {
    const validation = validateListingDetails(draft);
    setErrors(validation.errors);
    if (!validation.ok) return;
    setSaving(true);
    try {
      await syncDraft();
      navigation.navigate('ListingMeasurements');
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ListingWizard
      step={2}
      title="Basic details"
      subtitle="Describe your outfit clearly. Example: Red embroidered bridal lehenga."
      onContinue={continueStep}
      loading={saving}
    >
      <AppInput
        label="Title"
        value={draft.title}
        onChangeText={(title) => patch({ title })}
        placeholder="Royal Red Bridal Lehenga"
        error={errors.title}
        maxLength={100}
        accessibilityLabel="Listing title"
      />
      <AppTextArea
        label="Description"
        value={draft.description}
        onChangeText={(description) => patch({ description })}
        placeholder="Describe the fabric, work, and occasions it suits."
        error={errors.description}
        maxLength={1000}
      />
      <Text style={styles.count}>{(draft.description || '').length}/1000</Text>

      <ListingFormSection title="Category" helper="Choose the closest match.">
        <View style={styles.wrap}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              selected={draft.category?.id === category.id}
              onPress={() => patch({
                category: { id: category.id, slug: category.slug, name: category.name },
              })}
            />
          ))}
        </View>
        <ListingValidationMessage message={errors.category} />
      </ListingFormSection>

      <ListingFormSection title="Gender">
        <View style={styles.wrap}>
          {GENDER_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={draft.gender === option.value}
              onPress={() => patch({ gender: option.value })}
            />
          ))}
        </View>
        <ListingValidationMessage message={errors.gender} />
      </ListingFormSection>

      <AppInput
        label="Brand (optional)"
        value={draft.brand}
        onChangeText={(brand) => patch({ brand })}
        placeholder="Local boutique or handmade"
        accessibilityLabel="Brand"
      />

      <ListingFormSection title="Primary color">
        <View style={styles.wrap}>
          {COLOR_OPTIONS.map((color) => (
            <Chip
              key={color}
              label={color}
              selected={color === 'Other' ? customColor : draft.color === color}
              onPress={() => {
                if (color === 'Other') {
                  setCustomColor(true);
                  patch({ color: '' });
                  return;
                }
                setCustomColor(false);
                patch({ color });
              }}
            />
          ))}
        </View>
        {customColor ? (
          <TextInput
            value={draft.color}
            onChangeText={(color) => patch({ color })}
            placeholder="Enter a color"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Custom color"
            style={styles.custom}
          />
        ) : null}
      </ListingFormSection>

      <ListingFormSection title="Occasion" helper="Select every occasion this outfit suits.">
        <View style={styles.wrap}>
          {OCCASION_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={(draft.occasion || []).includes(option.value)}
              onPress={() => toggleOccasion(option.value)}
            />
          ))}
        </View>
      </ListingFormSection>
      <ListingValidationMessage message={errors.form} />
    </ListingWizard>
  );
};

const styles = StyleSheet.create({
  count: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  chipTextOn: {
    color: colors.textLight,
  },
  custom: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
});

export default ListingDetailsScreen;
