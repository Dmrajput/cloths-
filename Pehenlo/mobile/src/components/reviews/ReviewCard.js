import { Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import RatingStars from './RatingStars';
import VerifiedRentalBadge from './VerifiedRentalBadge';
import { REVIEW_STATUS_LABELS } from '../../constants/reviewConstants';

const { colors, typography, spacing, radius } = THEME;

function reviewDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const ReviewCard = ({ review, onReport, showStatus = false }) => {
  const name = review?.reviewer?.name || 'Pehenlo member';
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.name}>{name}</Text>
        {onReport ? (
          <Pressable onPress={onReport} accessibilityRole="button" accessibilityLabel="Report review" style={styles.report}>
            <Text style={styles.reportText}>Report</Text>
          </Pressable>
        ) : null}
      </View>
      {review?.isVerifiedRental ? <VerifiedRentalBadge /> : null}
      <RatingStars value={review?.rating || 0} size={16} />
      {review?.title ? <Text style={styles.title}>{review.title}</Text> : null}
      {review?.comment ? <Text style={styles.comment}>{review.comment}</Text> : null}
      <Text style={styles.date}>{reviewDate(review?.createdAt)}</Text>
      {showStatus && review?.status ? (
        <Text style={styles.status}>{REVIEW_STATUS_LABELS[review.status] || review.status}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { ...typography.body, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  report: { minHeight: 44, justifyContent: 'center', paddingLeft: spacing.md },
  reportText: { ...typography.caption, color: colors.textSecondary },
  title: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.xs },
  comment: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  date: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  status: { ...typography.caption, color: colors.primary, marginTop: spacing.xs },
});

export default ReviewCard;
