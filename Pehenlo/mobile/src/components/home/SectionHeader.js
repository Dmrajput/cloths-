import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { TextButton } from '../buttons';

const { colors, typography, spacing } = THEME;

const SectionHeader = ({ title, actionLabel = 'See All', onActionPress }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      {onActionPress ? (
        <TextButton
          title={actionLabel}
          onPress={onActionPress}
          accessibilityLabel={`${actionLabel} ${title}`}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingRight: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
});

export default SectionHeader;
