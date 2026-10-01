import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import ListingWizard from '../../components/listing/ListingWizard';
import ListingSummaryCard from '../../components/listing/ListingSummaryCard';
import ListingValidationMessage from '../../components/listing/ListingValidationMessage';
import { useListingDraft } from '../../context/ListingDraftContext';
import {
  conditionLabel,
  durationLabel,
  genderLabel,
  occasionLabel,
} from '../../constants/listingConstants';
import { moneyLabel } from '../../utils/listingHelpers';
import { validateCompleteListing } from '../../utils/listingValidation';

const { colors, typography, spacing, radius } = THEME;

const Line = ({ children }) => <Text style={styles.line}>{children}</Text>;

const ListingReviewScreen = () => {
  const navigation = useNavigation();
  const { activeDraft, submitActiveDraft } = useListingDraft();
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const draft = activeDraft || { photos: [], occasion: [], measurements: {}, blockedDates: [] };

  const submit = async () => {
    const validation = validateCompleteListing(draft);
    setErrors(validation.errors);
    if (!validation.ok) return;
    setSaving(true);
    try {
      const result = await submitActiveDraft();
      navigation.navigate('ListingSuccess', {
        listingId: result.listingId,
        status: result.status,
      });
    } catch (error) {
      const serverErrors = error.errors || {};
      setErrors({
        ...serverErrors,
        form: error.message || 'Unable to submit your listing.',
      });
    } finally {
      setSaving(false);
    }
  };

  const measurementText = Object.entries(draft.measurements || {})
    .filter(([key, value]) => !['unit', 'notes'].includes(key) && value !== '' && value != null)
    .map(([key, value]) => `${key} ${value}`)
    .join(', ');

  return (
    <ListingWizard
      step={7}
      title="Review your listing"
      subtitle="It will be reviewed before it appears on Explore."
      onContinue={submit}
      continueLabel="Submit for Approval"
      loading={saving}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photos}>
        {(draft.photos || []).map((photo, index) => (
          <Image key={photo.url || photo.localUri || String(index)} source={{ uri: photo.localUri || photo.url }} style={styles.photo} />
        ))}
      </ScrollView>
      <Text style={styles.heading}>{draft.title}</Text>
      <Line>{draft.category?.name || 'Category'} · {genderLabel(draft.gender)}</Line>
      <Line>{moneyLabel(draft.price)} / {durationLabel(draft.rentalDuration)}</Line>
      <Line>Security deposit {moneyLabel(draft.securityDeposit || 0)}</Line>
      <Line>{draft.pickupArea ? `${draft.pickupArea}, ` : ''}{draft.city}</Line>

      <ListingSummaryCard title="Photos" onEdit={() => navigation.navigate('ListingPhotos')}>
        <Line>{(draft.photos || []).length} photo{(draft.photos || []).length === 1 ? '' : 's'}</Line>
      </ListingSummaryCard>
      <ListingSummaryCard title="Details" onEdit={() => navigation.navigate('ListingDetails')}>
        <Line>{draft.description}</Line>
        {draft.brand ? <Line>Brand: {draft.brand}</Line> : null}
        {draft.color ? <Line>Color: {draft.color}</Line> : null}
        <Line>{(draft.occasion || []).map(occasionLabel).join(', ') || 'No occasion selected'}</Line>
      </ListingSummaryCard>
      <ListingSummaryCard title="Size and condition" onEdit={() => navigation.navigate('ListingMeasurements')}>
        <Line>Size: {draft.size}</Line>
        {measurementText ? <Line>{measurementText} {draft.measurements?.unit}</Line> : null}
        <Line>Condition: {conditionLabel(draft.condition)}</Line>
        {draft.conditionNotes ? <Line>{draft.conditionNotes}</Line> : null}
        <Line>{draft.hasDamage ? `Damage: ${draft.damageDescription}` : 'No visible damage disclosed'}</Line>
      </ListingSummaryCard>
      <ListingSummaryCard title="Pricing" onEdit={() => navigation.navigate('ListingPricing')}>
        <Line>Rental price {moneyLabel(draft.price)}</Line>
        <Line>Duration {durationLabel(draft.rentalDuration)}</Line>
        <Line>Security deposit {moneyLabel(draft.securityDeposit || 0)}</Line>
        <Line>Cleaning fee {moneyLabel(draft.cleaningFee || 0)}</Line>
      </ListingSummaryCard>
      <ListingSummaryCard title="Availability" onEdit={() => navigation.navigate('ListingAvailability')}>
        <Line>{draft.availabilityMode === 'MANUAL' ? 'Managed dates' : 'Always available'}</Line>
        {(draft.blockedDates || []).length ? <Line>Blocked: {draft.blockedDates.join(', ')}</Line> : null}
      </ListingSummaryCard>
      <ListingSummaryCard title="Delivery" onEdit={() => navigation.navigate('ListingDelivery')}>
        <Line>
          {draft.pickupAvailable ? 'Pickup' : ''}
          {draft.pickupAvailable && draft.deliveryAvailable ? ' and ' : ''}
          {draft.deliveryAvailable ? 'Delivery' : ''}
        </Line>
        <Line>{draft.city}, {draft.state}</Line>
        {draft.pickupArea ? <Line>Area: {draft.pickupArea}</Line> : null}
      </ListingSummaryCard>
      <ListingValidationMessage message={errors.form} />
      {Object.entries(errors).filter(([key]) => key !== 'form').map(([key, message]) => (
        <ListingValidationMessage key={key} message={message} />
      ))}
    </ListingWizard>
  );
};

const styles = StyleSheet.create({
  photos: {
    marginBottom: spacing.md,
  },
  photo: {
    width: 96,
    height: 120,
    borderRadius: radius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  line: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default ListingReviewScreen;
