import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const SearchInput = ({
  value,
  onChangeText,
  placeholder = 'Search outfits...',
  onClear,
  style,
}) => {
  const showClear = Boolean(value && value.length > 0);

  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="search"
        size={20}
        color={colors.textMuted}
        style={styles.searchIcon}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="search"
      />

      {showClear ? (
        <Pressable
          onPress={onClear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
});

export default SearchInput;
