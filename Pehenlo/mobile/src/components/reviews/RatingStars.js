import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { colors } = THEME;

const RatingStars = ({ value = 0, onChange, size = 28 }) => (
  <View style={styles.row} accessibilityLabel={`${value || 0} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Pressable
        key={star}
        onPress={onChange ? () => onChange(star) : undefined}
        disabled={!onChange}
        accessibilityRole="button"
        accessibilityLabel={`${star} out of 5 stars`}
        style={styles.hit}
      >
        <Ionicons name={star <= value ? 'star' : 'star-outline'} size={size} color={colors.secondary} />
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  hit: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});

export default RatingStars;
