import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { formatEventTime } from '../../utils/rentalHelpers';

const { colors, typography, spacing } = THEME;

const BookingTimeline = ({ steps = [] }) => {
  if (!steps.length) return null;
  return (
    <View style={styles.wrap} accessibilityLabel="Booking timeline">
      <Text style={styles.heading}>Timeline</Text>
      {steps.map((step) => (
        <View key={step.type} style={styles.row}>
          <Text style={[styles.mark, step.done ? styles.done : styles.pending]}>{step.done ? '✓' : '○'}</Text>
          <View style={styles.copy}>
            <Text style={styles.label}>{step.label}</Text>
            {step.done && step.at ? <Text style={styles.time}>{formatEventTime(step.at)}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  heading: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', marginBottom: spacing.md },
  mark: { width: 24, ...typography.label },
  done: { color: colors.success },
  pending: { color: colors.textMuted },
  copy: { flex: 1 },
  label: { ...typography.body, color: colors.textPrimary },
  time: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});

export default BookingTimeline;
