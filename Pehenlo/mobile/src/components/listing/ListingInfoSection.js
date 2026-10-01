import { Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing } = THEME;

const ListingInfoSection = ({ title, children, actionLabel, onAction }) => (
  <View style={styles.section}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
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
  action: {
    minHeight: 44,
    justifyContent: 'center',
  },
  actionText: {
    ...typography.label,
    color: colors.primary,
  },
});

export default ListingInfoSection;
