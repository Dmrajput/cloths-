import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { DURATION_OPTIONS, PLATFORM_COMMISSION_PERCENT } from '../../constants/listingConstants';
import ListingWizard from '../../components/listing/ListingWizard';
import ListingFormSection from '../../components/listing/ListingFormSection';
import PriceInput from '../../components/listing/PriceInput';
import ListingValidationMessage from '../../components/listing/ListingValidationMessage';
import { useListingDraft } from '../../context/ListingDraftContext';
import { validateListingPricing } from '../../utils/listingValidation';
import { moneyLabel } from '../../utils/listingHelpers';

const { colors, typography, spacing, radius } = THEME;

const ListingPricingScreen = () => {
  const navigation = useNavigation();
  const { activeDraft, updateDraft, syncDraft } = useListingDraft();
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const draft = activeDraft || {};
  const price = Number(draft.price) || 0;
  const platformFee = Math.round((price * PLATFORM_COMMISSION_PERCENT) / 100);
  const earning = Math.max(price - platformFee, 0);

  const continueStep = async () => {
    const validation = validateListingPricing(draft);
    setErrors(validation.errors);
    if (!validation.ok) return;
    setSaving(true);
    try {
      await syncDraft();
      navigation.navigate('ListingAvailability');
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ListingWizard
      step={4}
      title="Pricing"
      subtitle="Renters pay the rental price. The security deposit is refundable and is not your earning."
      onContinue={continueStep}
      loading={saving}
    >
      <PriceInput
        label="Rental price"
        value={draft.price}
        onChangeText={(priceValue) => updateDraft({ price: priceValue })}
        error={errors.price}
        accessibilityLabel="Rental price"
        placeholder="1500"
      />
      <ListingFormSection title="Rental duration">
        <View style={styles.wrap}>
          {DURATION_OPTIONS.map((option) => {
            const selected = draft.rentalDuration === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => updateDraft({ rentalDuration: option.value })}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
                style={[styles.chip, selected && styles.chipOn]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextOn]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <ListingValidationMessage message={errors.rentalDuration} />
      </ListingFormSection>
      <PriceInput
        label="Security deposit"
        value={draft.securityDeposit}
        onChangeText={(securityDeposit) => updateDraft({ securityDeposit })}
        error={errors.securityDeposit}
        accessibilityLabel="Security deposit"
        placeholder="3000"
      />
      <Text style={styles.note}>
        This amount is refundable to the renter after the outfit is returned, subject to Pehenlo’s damage and return policy. It is not platform revenue.
      </Text>
      <PriceInput
        label="Cleaning fee (optional)"
        value={draft.cleaningFee}
        onChangeText={(cleaningFee) => updateDraft({ cleaningFee })}
        error={errors.cleaningFee}
        accessibilityLabel="Cleaning fee"
        placeholder="0"
      />
      <Text style={styles.note}>The renter pays this fee. Leave it at 0 if cleaning is included.</Text>
      <View style={styles.estimate}>
        <Text style={styles.estimateTitle}>Estimated earning</Text>
        <Text style={styles.line}>Rental price {moneyLabel(price)}</Text>
        <Text style={styles.line}>Estimated Pehenlo fee ({PLATFORM_COMMISSION_PERCENT}%) {moneyLabel(platformFee)}</Text>
        <Text style={styles.earning}>Estimated you receive {moneyLabel(earning)}</Text>
        <Text style={styles.note}>This is an estimate only, not guaranteed earnings. Payouts are handled later.</Text>
      </View>
      <ListingValidationMessage message={errors.form} />
    </ListingWizard>
  );
};

const styles = StyleSheet.create({
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
  note: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  estimate: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  estimateTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  line: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  earning: {
    ...typography.label,
    color: colors.primary,
    marginVertical: spacing.sm,
  },
});

export default ListingPricingScreen;
