import { FlatList, StyleSheet, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { CategoryCard } from '../cards';
import SectionHeader from './SectionHeader';

const { spacing } = THEME;

const CategoryList = ({ categories, onPressCategory, onSeeAll }) => {
  return (
    <View style={styles.wrap}>
      <SectionHeader title="Categories" onActionPress={onSeeAll} />
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <CategoryCard
            name={item.name}
            icon={item.icon || 'shirt-outline'}
            image={item.image}
            onPress={() => onPressCategory(item)}
            style={styles.card}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
  },
  card: {
    marginRight: spacing.sm,
    width: 96,
  },
});

export default CategoryList;
