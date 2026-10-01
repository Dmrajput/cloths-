import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const RentalTabs = ({ tabs, value, onChange }) => {
  const equal = tabs.length <= 3;
  const items = tabs.map((tab) => {
    const selected = tab.id === value;
    return (
      <Pressable
        key={tab.id}
        onPress={() => onChange(tab.id)}
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        accessibilityLabel={tab.label}
        style={[styles.tab, equal && styles.equal, selected && styles.selected]}
      >
        <Text style={[styles.label, selected && styles.selectedLabel]} numberOfLines={1}>{tab.label}</Text>
      </Pressable>
    );
  });

  if (!equal) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroller}
        contentContainerStyle={styles.row}
      >
        {items}
      </ScrollView>
    );
  }

  return <View style={styles.row}>{items}</View>;
};

const styles = StyleSheet.create({
  scroller: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    flexGrow: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    height: 40,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equal: {
    flex: 1,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  selectedLabel: {
    color: colors.textLight,
  },
});

export default RentalTabs;
