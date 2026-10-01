import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../../constants/theme';

const { colors, typography, spacing } = THEME;

const FilterSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.body}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default FilterSection;
