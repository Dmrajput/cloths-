import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing, radius } = THEME;

const RatingSummary = ({ summary }) => {
  const count = summary?.reviewCount || 0;
  const average = Number(summary?.averageRating || 0);
  const distribution = summary?.distribution || {};
  return (
    <View style={styles.card} accessibilityLabel={`${average} out of 5 stars, ${count} reviews`}>
      <Text style={styles.average}>{count ? average.toFixed(1) : '—'}</Text>
      <Text style={styles.meta}>{count} {count === 1 ? 'review' : 'reviews'}</Text>
      {[5, 4, 3, 2, 1].map((star) => {
        const value = distribution[star] || distribution[String(star)] || 0;
        const width = count ? `${Math.round((value / count) * 100)}%` : '0%';
        return (
          <View key={star} style={styles.row}>
            <Text style={styles.star}>{star} ★</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width }]} />
            </View>
            <Text style={styles.count}>{value}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  average: { ...typography.h1, color: colors.textPrimary },
  meta: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  star: { width: 36, ...typography.caption, color: colors.textSecondary },
  track: { flex: 1, height: 8, borderRadius: radius.round, backgroundColor: colors.background, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.secondary },
  count: { width: 28, textAlign: 'right', ...typography.caption, color: colors.textSecondary },
});

export default RatingSummary;
