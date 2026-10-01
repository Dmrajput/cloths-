import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing } = THEME;

const ListingFormSection = ({ title, helper, children }) => (
  <View style={styles.section}>
    {title ? <Text style={styles.title}>{title}</Text> : null}
    {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  helper: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});

export default ListingFormSection;
