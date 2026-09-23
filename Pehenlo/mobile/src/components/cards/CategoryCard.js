import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius, shadows } = THEME;

const CategoryCard = ({
  name,
  icon,
  image,
  onPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Ionicons
            name={icon || 'sparkles-outline'}
            size={28}
            color={colors.primary}
          />
        )}
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    minWidth: 88,
    ...shadows.small,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: colors.surfaceSecondary,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

export default CategoryCard;
