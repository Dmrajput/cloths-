import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const ListingSummaryCard = ({ title, children, onEdit, editLabel = 'Edit' }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {onEdit ? (
        <Text onPress={onEdit} accessibilityRole="button" accessibilityLabel={`Edit ${title}`} style={styles.edit}>
          {editLabel}
        </Text>
      ) : null}
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  edit: {
    ...typography.label,
    color: colors.primary,
    minHeight: 44,
    textAlignVertical: 'center',
  },
});

export default ListingSummaryCard;
