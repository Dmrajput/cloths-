import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import ListingWizard from '../../components/listing/ListingWizard';
import ListingFormSection from '../../components/listing/ListingFormSection';
import ListingValidationMessage from '../../components/listing/ListingValidationMessage';
import { useListingDraft } from '../../context/ListingDraftContext';
import { validateListingAvailability } from '../../utils/listingValidation';
import { monthDays, todayKey } from '../../utils/listingHelpers';

const { colors, typography, spacing, radius } = THEME;
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const ListingAvailabilityScreen = () => {
  const navigation = useNavigation();
  const { activeDraft, updateDraft, syncDraft } = useListingDraft();
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const draft = activeDraft || { availabilityMode: 'ALWAYS', blockedDates: [] };
  const cursor = new Date();
  cursor.setMonth(cursor.getMonth() + monthOffset);
  const year = cursor.getFullYear();
  const monthIndex = cursor.getMonth();
  const cells = monthDays(year, monthIndex);
  const today = todayKey();
  const monthLabel = cursor.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const toggleDate = (key) => {
    if (key < today) return;
    const current = draft.blockedDates || [];
    const blockedDates = current.includes(key)
      ? current.filter((date) => date !== key)
      : [...current, key];
    updateDraft({ blockedDates, availabilityMode: 'MANUAL' });
  };

  const continueStep = async () => {
    const validation = validateListingAvailability(draft);
    setErrors(validation.errors);
    if (!validation.ok) return;
    setSaving(true);
    try {
      await syncDraft();
      navigation.navigate('ListingDelivery');
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ListingWizard
      step={5}
      title="Availability"
      subtitle="This only saves your preference. Booking dates are not reserved yet."
      onContinue={continueStep}
      loading={saving}
    >
      <ListingFormSection title="How should renters see this outfit?">
        <Pressable
          onPress={() => updateDraft({ availabilityMode: 'ALWAYS' })}
          accessibilityRole="button"
          accessibilityLabel="Always available"
          style={[styles.choice, draft.availabilityMode === 'ALWAYS' && styles.choiceOn]}
        >
          <Text style={styles.choiceTitle}>Always available</Text>
          <Text style={styles.choiceBody}>The outfit stays generally available until you change it.</Text>
        </Pressable>
        <Pressable
          onPress={() => updateDraft({ availabilityMode: 'MANUAL' })}
          accessibilityRole="button"
          accessibilityLabel="Manage dates manually"
          style={[styles.choice, draft.availabilityMode === 'MANUAL' && styles.choiceOn]}
        >
          <Text style={styles.choiceTitle}>I’ll manage dates manually</Text>
          <Text style={styles.choiceBody}>Mark days when the outfit cannot be rented.</Text>
        </Pressable>
      </ListingFormSection>

      {draft.availabilityMode === 'MANUAL' ? (
        <View>
          <View style={styles.monthRow}>
            <Pressable onPress={() => setMonthOffset((value) => Math.max(0, value - 1))} accessibilityRole="button" accessibilityLabel="Previous month" style={styles.monthButton}>
              <Text style={styles.monthButtonText}>Prev</Text>
            </Pressable>
            <Text style={styles.month}>{monthLabel}</Text>
            <Pressable onPress={() => setMonthOffset((value) => Math.min(3, value + 1))} accessibilityRole="button" accessibilityLabel="Next month" style={styles.monthButton}>
              <Text style={styles.monthButtonText}>Next</Text>
            </Pressable>
          </View>
          <View style={styles.week}>
            {WEEKDAYS.map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}
          </View>
          <View style={styles.week}>
            {cells.map((cell, index) => {
              if (!cell) return <View key={`empty-${index}`} style={styles.day} />;
              const selected = (draft.blockedDates || []).includes(cell.key);
              const past = cell.key < today;
              return (
                <Pressable
                  key={cell.key}
                  disabled={past}
                  onPress={() => toggleDate(cell.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`${selected ? 'Unblock' : 'Block'} ${cell.key}`}
                  accessibilityState={{ selected, disabled: past }}
                  style={[styles.day, selected && styles.dayOn, past && styles.dayPast]}
                >
                  <Text style={[styles.dayText, selected && styles.dayTextOn]}>{cell.day}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.note}>{(draft.blockedDates || []).length} blocked date{(draft.blockedDates || []).length === 1 ? '' : 's'}</Text>
        </View>
      ) : null}
      <ListingValidationMessage message={errors.availability || errors.form} />
    </ListingWizard>
  );
};

const styles = StyleSheet.create({
  choice: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  choiceOn: {
    borderColor: colors.primary,
  },
  choiceTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  choiceBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  month: {
    ...typography.label,
    color: colors.textPrimary,
  },
  monthButton: {
    minWidth: 64,
    minHeight: 44,
    justifyContent: 'center',
  },
  monthButtonText: {
    ...typography.label,
    color: colors.primary,
  },
  week: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekday: {
    width: '14.28%',
    textAlign: 'center',
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: {
    backgroundColor: colors.primary,
    borderRadius: radius.round,
  },
  dayPast: {
    opacity: 0.35,
  },
  dayText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  dayTextOn: {
    color: colors.textLight,
  },
  note: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

export default ListingAvailabilityScreen;
