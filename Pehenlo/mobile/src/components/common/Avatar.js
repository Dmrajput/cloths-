import { Image, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography } = THEME;

function getInitials(name) {
  if (!name) {
    return '?';
  }

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

const Avatar = ({ uri, name, size = 40, style }) => {
  const fontSize = Math.max(12, Math.round(size * 0.4));
  const label = name ? `Avatar for ${name}` : 'User avatar';

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    ...typography.label,
    color: colors.textLight,
    fontWeight: '700',
  },
});

export default Avatar;
