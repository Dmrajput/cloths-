import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { conditionLabel } from '../../constants/listingConstants';

const { colors, typography, spacing, radius } = THEME;

const ConditionCard = ({ condition, notes, hasDamage, damageDescription }) => (
  <View>
    {condition ? <Text style={styles.value}>{conditionLabel(condition) || condition}</Text> : null}
    {notes ? <Text style={styles.notes}>{notes}</Text> : null}
    {hasDamage ? (
      <View style={styles.disclosure}>
        <Text style={styles.disclosureTitle}>Condition note</Text>
        <Text style={styles.disclosureBody}>
          This outfit has a disclosed issue: {damageDescription || 'The owner marked visible damage.'}
        </Text>
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  value: {
    ...typography.label,
    color: colors.textPrimary,
  },
  notes: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  disclosure: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  disclosureTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  disclosureBody: {
    ...typography.body,
    color: colors.textPrimary,
  },
});

export default ConditionCard;
