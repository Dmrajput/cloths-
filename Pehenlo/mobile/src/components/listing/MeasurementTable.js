import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { MEASUREMENT_LABELS } from '../../constants/listingConstants';

const { colors, typography, spacing } = THEME;

const KEYS = ['bust', 'chest', 'waist', 'hip', 'shoulder', 'sleeveLength', 'length', 'blouseLength', 'skirtLength'];

const MeasurementTable = ({ measurements }) => {
  if (!measurements) return null;
  const rows = KEYS.filter((key) => measurements[key] != null && Number(measurements[key]) > 0);
  if (!rows.length && !measurements.notes) return null;
  const unit = measurements.unit === 'cm' ? 'cm' : 'in';

  return (
    <View>
      {rows.map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{MEASUREMENT_LABELS[key] || key}</Text>
          <Text style={styles.value}>{measurements[key]} {unit}</Text>
        </View>
      ))}
      {measurements.notes ? <Text style={styles.notes}>{measurements.notes}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  value: {
    ...typography.label,
    color: colors.textPrimary,
  },
  notes: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

export default MeasurementTable;
