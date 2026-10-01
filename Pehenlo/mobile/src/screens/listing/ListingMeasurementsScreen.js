import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { SIZE_OPTIONS, getMeasurementFields } from '../../constants/listingConstants';
import ListingWizard from '../../components/listing/ListingWizard';
import ListingFormSection from '../../components/listing/ListingFormSection';
import MeasurementInput from '../../components/listing/MeasurementInput';
import ConditionSelector from '../../components/listing/ConditionSelector';
import ListingValidationMessage from '../../components/listing/ListingValidationMessage';
import { AppTextArea } from '../../components/inputs';
import { useListingDraft } from '../../context/ListingDraftContext';
import { validateListingMeasurements } from '../../utils/listingValidation';

const { colors, typography, spacing, radius } = THEME;

const ListingMeasurementsScreen = () => {
  const navigation = useNavigation();
  const { activeDraft, updateDraft, syncDraft } = useListingDraft();
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const draft = activeDraft || { measurements: { unit: 'inches' } };
  const unit = draft.measurements?.unit === 'cm' ? 'cm' : 'inches';
  const fields = getMeasurementFields(draft.category?.slug, draft.gender);

  const setMeasurement = (key, value) => {
    updateDraft({
      measurements: { ...draft.measurements, unit, [key]: value },
    });
  };

  const continueStep = async () => {
    const validation = validateListingMeasurements(draft);
    setErrors(validation.errors);
    if (!validation.ok) return;
    setSaving(true);
    try {
      await syncDraft();
      navigation.navigate('ListingPricing');
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ListingWizard
      step={3}
      title="Size and condition"
      subtitle="Accurate condition details help renters trust your listing."
      onContinue={continueStep}
      loading={saving}
    >
      <ListingFormSection title="Size">
        <View style={styles.wrap}>
          {SIZE_OPTIONS.map((size) => {
            const selected = draft.size === size;
            return (
              <Pressable
                key={size}
                onPress={() => updateDraft({ size })}
                accessibilityRole="button"
                accessibilityLabel={`Size ${size}`}
                accessibilityState={{ selected }}
                style={[styles.chip, selected && styles.chipOn]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextOn]}>{size}</Text>
              </Pressable>
            );
          })}
        </View>
        <ListingValidationMessage message={errors.size} />
      </ListingFormSection>

      {fields.length ? (
        <ListingFormSection title="Measurements" helper="Optional. Leave blank if you are not sure.">
          <View style={styles.unitRow}>
            {['inches', 'cm'].map((option) => (
              <Pressable
                key={option}
                onPress={() => updateDraft({ measurements: { ...draft.measurements, unit: option } })}
                accessibilityRole="button"
                accessibilityLabel={`Measure in ${option}`}
                style={[styles.chip, unit === option && styles.chipOn]}
              >
                <Text style={[styles.chipText, unit === option && styles.chipTextOn]}>{option}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.fields}>
            {fields.map((field) => (
              <MeasurementInput
                key={field.key}
                label={field.label}
                unit={unit}
                value={draft.measurements?.[field.key] || ''}
                error={errors[field.key]}
                onChangeText={(value) => setMeasurement(field.key, value)}
              />
            ))}
          </View>
        </ListingFormSection>
      ) : (
        <Text style={styles.note}>Measurements are optional for this category. Add a note if the size needs context.</Text>
      )}

      <AppTextArea
        label="Measurement notes (optional)"
        value={draft.measurements?.notes || ''}
        onChangeText={(notes) => setMeasurement('notes', notes)}
        maxLength={300}
        placeholder="Free size, or anything a renter should know."
      />

      <ListingFormSection title="Condition">
        <ConditionSelector value={draft.condition} onChange={(condition) => updateDraft({ condition })} />
        <ListingValidationMessage message={errors.condition} />
      </ListingFormSection>

      <AppTextArea
        label="Condition notes (optional)"
        value={draft.conditionNotes}
        onChangeText={(conditionNotes) => updateDraft({ conditionNotes })}
        maxLength={500}
        placeholder="Worn once. No visible stains."
      />
      <ListingValidationMessage message={errors.conditionNotes} />

      <ListingFormSection title="Visible damage or defects?">
        <View style={styles.wrap}>
          {[{ label: 'No', value: false }, { label: 'Yes', value: true }].map((option) => {
            const selected = Boolean(draft.hasDamage) === option.value;
            return (
              <Pressable
                key={option.label}
                onPress={() => updateDraft({ hasDamage: option.value })}
                accessibilityRole="button"
                accessibilityLabel={option.value ? 'Outfit has damage' : 'Outfit has no damage'}
                style={[styles.chip, selected && styles.chipOn]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextOn]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {draft.hasDamage ? (
          <AppTextArea
            label="Describe the issue"
            value={draft.damageDescription}
            onChangeText={(damageDescription) => updateDraft({ damageDescription })}
            maxLength={500}
            error={errors.damageDescription}
            placeholder="Minor stitching repair on the inner lining."
          />
        ) : null}
      </ListingFormSection>
      <ListingValidationMessage message={errors.form} />
    </ListingWizard>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  unitRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  fields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  note: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});

export default ListingMeasurementsScreen;
