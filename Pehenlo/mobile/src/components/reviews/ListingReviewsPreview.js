import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import RatingSummary from './RatingSummary';
import ReviewCard from './ReviewCard';
import { reviewService } from '../../services/reviewService';
import { REPORT_TARGETS } from '../../constants/safetyConstants';

const { colors, typography, spacing } = THEME;

const ListingReviewsPreview = ({ listingId }) => {
  const navigation = useNavigation();
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      reviewService.getListingReviewSummary(listingId),
      reviewService.getListingReviews(listingId, { page: 1, limit: 2 }),
    ]).then(([summaryResponse, listResponse]) => {
      if (!active) return;
      setSummary(summaryResponse?.data || null);
      setItems(listResponse?.data?.items || []);
    }).catch(() => {
      if (active) setSummary(null);
    });
    return () => {
      active = false;
    };
  }, [listingId]);

  return (
    <View>
      <RatingSummary summary={summary} />
      {summary?.reviewCount ? <Text style={styles.note}>Verified Rental reviews come from completed Pehenlo bookings.</Text> : null}
      {items.map((item) => (
        <ReviewCard
          key={item.id}
          review={item}
          onReport={() => navigation.navigate('Report', { targetType: REPORT_TARGETS.REVIEW, targetId: item.id })}
        />
      ))}
      <Pressable
        onPress={() => navigation.navigate('Reviews', { listingId })}
        accessibilityRole="button"
        accessibilityLabel="See all reviews"
        style={styles.link}
      >
        <Text style={styles.linkText}>See all reviews</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  note: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  link: { minHeight: 44, justifyContent: 'center' },
  linkText: { ...typography.body, color: colors.primary, fontWeight: '600' },
});

export default ListingReviewsPreview;
