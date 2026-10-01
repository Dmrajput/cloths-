import { FlatList, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import OutfitCard from '../cards/OutfitCard';

const { colors, typography, spacing } = THEME;

const SimilarListings = ({ listings, onPress }) => {
  if (!listings?.length) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Similar outfits</Text>
      <FlatList
        horizontal
        data={listings}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        renderItem={({ item }) => (
          <OutfitCard
            image={item.coverImage}
            title={item.title}
            price={item.price}
            duration={item.rentalDuration}
            rating={item.reviewCount > 0 ? item.rating : null}
            location={item.city}
            onPress={() => onPress(item)}
            style={styles.card}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    width: 168,
    marginRight: spacing.md,
  },
});

export default SimilarListings;
