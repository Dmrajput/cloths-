import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';
import { AppInput, AppTextArea } from '../../components/inputs';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import RatingStars from '../../components/reviews/RatingStars';
import { REVIEW_TYPE_LABELS, REVIEW_STATUS_LABELS } from '../../constants/reviewConstants';
import { bookingService } from '../../services/bookingService';
import { reviewService } from '../../services/reviewService';
import { formatLongDate } from '../../utils/rentalHelpers';

const { colors, typography, spacing } = THEME;

const TYPE_KEYS = {
  OUTFIT_REVIEW: 'outfit',
  OWNER_REVIEW: 'owner',
  RENTER_REVIEW: 'renter',
};

const WriteReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const bookingId = route.params?.bookingId;
  const type = route.params?.type;
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [reviewId, setReviewId] = useState(route.params?.reviewId || null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!bookingId) return;
    try {
      const response = await bookingService.getBookingById(bookingId);
      const next = response?.data?.booking;
      setBooking(next || null);
      const existing = next?.reviewState?.[TYPE_KEYS[type]];
      if (existing) {
        setReviewId(existing.id);
        setRating(existing.rating || 0);
        setTitle(existing.title || '');
        setComment(existing.comment || '');
        setStatus(existing.status || '');
      }
    } catch (loadError) {
      setError(loadError.message || 'Could not load this rental.');
    }
  }, [bookingId, type]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const submit = async () => {
    if (!rating || saving) return;
    setSaving(true);
    setError('');
    try {
      const payload = { rating, title: title.trim(), comment: comment.trim() };
      const response = reviewId
        ? await reviewService.updateReview(reviewId, payload)
        : await reviewService.createReview({ bookingId, type, ...payload });
      const review = response?.data?.review;
      const nextStatus = review?.status;
      Alert.alert(
        'Review submitted',
        nextStatus === 'PENDING_MODERATION'
          ? 'Your review has been submitted for review.'
          : 'Your review is now visible.'
      );
      navigation.goBack();
    } catch (saveError) {
      setError(saveError.message || 'Could not submit the review.');
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    Alert.alert('Delete your review?', 'Your review will no longer be shown.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await reviewService.deleteReview(reviewId);
            navigation.goBack();
          } catch (deleteError) {
            setError(deleteError.message || 'Could not delete the review.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title={reviewId ? 'Your Review' : 'How was your rental?'} showBack onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.outfit}>{booking?.outfit?.title || 'Outfit'}</Text>
        {booking?.startDate ? (
          <Text style={styles.meta}>{formatLongDate(booking.startDate)} – {formatLongDate(booking.endDate)}</Text>
        ) : null}
        <Text style={styles.label}>{REVIEW_TYPE_LABELS[type] || 'Review'}</Text>
        <RatingStars value={rating} onChange={setRating} />
        {status ? <Text style={styles.status}>{REVIEW_STATUS_LABELS[status] || status}</Text> : null}
        <AppInput label="Title (optional)" value={title} onChangeText={setTitle} maxLength={100} />
        <AppTextArea label="Review" value={comment} onChangeText={setComment} maxLength={1000} />
        <Text style={styles.count}>{comment.length}/1000</Text>
        <Text style={styles.note}>Please keep reviews respectful and based on your actual rental experience.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          title={saving ? 'Saving...' : reviewId ? 'Save Changes' : 'Submit Review'}
          onPress={submit}
          disabled={!rating || saving}
        />
        {reviewId ? <OutlineButton title="Delete Review" onPress={remove} /> : null}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.sm },
  outfit: { ...typography.h3, color: colors.textPrimary },
  meta: { ...typography.body, color: colors.textSecondary },
  label: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.sm },
  status: { ...typography.caption, color: colors.primary },
  count: { ...typography.caption, color: colors.textMuted, textAlign: 'right' },
  note: { ...typography.caption, color: colors.textSecondary },
  error: { ...typography.caption, color: colors.error },
});

export default WriteReviewScreen;
