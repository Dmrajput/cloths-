import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { dateKey, formatMonthTitle, monthCells } from '../../utils/bookingHelpers';

const { colors, typography, spacing, radius } = THEME;
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const AvailabilityCalendar = ({
  year,
  month,
  today,
  startDate,
  endDate,
  unavailable,
  onSelect,
  onPrevious,
  onNext,
  loading,
}) => {
  const cells = monthCells(year, month);

  return (
    <View>
      <View style={styles.nav}>
        <Pressable onPress={onPrevious} accessibilityRole="button" accessibilityLabel="Previous month" style={styles.navButton}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.month}>{formatMonthTitle(year, month)}</Text>
        <Pressable onPress={onNext} accessibilityRole="button" accessibilityLabel="Next month" style={styles.navButton}>
          <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>
      <View style={styles.week}>
        {WEEKDAYS.map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}
      </View>
      <View style={[styles.grid, loading && styles.loading]}>
        {cells.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.cell} />;
          const key = dateKey(year, month, day);
          const disabled = key < today || unavailable.has(key);
          const selected = key === startDate || key === endDate;
          const inRange = startDate && endDate && key > startDate && key < endDate;
          const isToday = key === today;
          const label = disabled
            ? `${key}, unavailable`
            : selected
              ? `${key}, selected`
              : isToday
                ? `${key}, today`
                : key;
          return (
            <Pressable
              key={key}
              disabled={disabled}
              onPress={() => onSelect(key)}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ disabled, selected }}
              style={styles.cell}
            >
              <View style={[
                styles.day,
                inRange && styles.inRange,
                selected && styles.selected,
                isToday && !selected && styles.today,
              ]}
              >
                <Text style={[
                  styles.dayText,
                  disabled && styles.disabledText,
                  selected && styles.selectedText,
                ]}
                >
                  {day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendItem}>● Selected</Text>
        <Text style={styles.legendItem}>○ Available</Text>
        <Text style={styles.legendItem}>× Unavailable</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  loading: {
    opacity: 0.45,
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inRange: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.sm,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  today: {
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  dayText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  disabledText: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  selectedText: {
    color: colors.textLight,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  legendItem: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default AvailabilityCalendar;
