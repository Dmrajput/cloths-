import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import ListingWizard from '../../components/listing/ListingWizard';
import ListingFormSection from '../../components/listing/ListingFormSection';
import PriceInput from '../../components/listing/PriceInput';
import ListingValidationMessage from '../../components/listing/ListingValidationMessage';
import { AppInput } from '../../components/inputs';
import { useListingDraft } from '../../context/ListingDraftContext';
import { validateListingDelivery } from '../../utils/listingValidation';

const { colors, typography, spacing, radius } = THEME;

const ListingDeliveryScreen = () => {
  const navigation = useNavigation();
  const { activeDraft, updateDraft, syncDraft } = useListingDraft();
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const draft = activeDraft || {};

  const setMode = (mode) => {
    updateDraft({
      pickupAvailable: mode === 'pickup' || mode === 'both',
      deliveryAvailable: mode === 'delivery' || mode === 'both',
    });
  };

  const mode = draft.pickupAvailable && draft.deliveryAvailable
    ? 'both'
    : draft.pickupAvailable
      ? 'pickup'
      : draft.deliveryAvailable
        ? 'delivery'
        : '';

  const continueStep = async () => {
    const validation = validateListingDelivery(draft);
    setErrors(validation.errors);
    if (!validation.ok) return;
    setSaving(true);
    try {
      await syncDraft();
      navigation.navigate('ListingReview');
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ListingWizard
      step={6}
      title="Pickup and delivery"
      subtitle="Renters will see your city and area, not your house address."
      onContinue={continueStep}
      loading={saving}
    >
      <ListingFormSection title="How can a renter receive it?">
        {[
          { id: 'pickup', label: 'Pickup' },
          { id: 'delivery', label: 'Delivery' },
          { id: 'both', label: 'Both' },
        ].map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setMode(option.id)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: mode === option.id }}
            style={[styles.choice, mode === option.id && styles.choiceOn]}
          >
            <Text style={[styles.choiceText, mode === option.id && styles.choiceTextOn]}>{option.label}</Text>
          </Pressable>
        ))}
        <ListingValidationMessage message={errors.receiving} />
      </ListingFormSection>

      <AppInput label="City" value={draft.city} onChangeText={(city) => updateDraft({ city })} error={errors.city} accessibilityLabel="City" />
      <AppInput label="State" value={draft.state} onChangeText={(state) => updateDraft({ state })} error={errors.state} accessibilityLabel="State" />
      {draft.pickupAvailable ? (
        <AppInput
          label="Area / locality"
          value={draft.pickupArea}
          onChangeText={(pickupArea) => updateDraft({ pickupArea })}
          placeholder="Satellite"
          error={errors.pickupArea}
          accessibilityLabel="Pickup area"
        />
      ) : null}
      {draft.deliveryAvailable ? (
        <PriceInput
          label="Delivery fee (optional)"
          value={draft.deliveryFee}
          onChangeText={(deliveryFee) => updateDraft({ deliveryFee })}
          error={errors.deliveryFee}
          accessibilityLabel="Delivery fee"
          placeholder="0"
        />
      ) : null}
      <Text style={styles.note}>Delivery tracking and logistics are not part of listing an outfit.</Text>
      <ListingValidationMessage message={errors.form} />
    </ListingWizard>
  );
};

const styles = StyleSheet.create({
  choice: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  choiceOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  choiceText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  choiceTextOn: {
    color: colors.textLight,
  },
  note: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

export default ListingDeliveryScreen;
