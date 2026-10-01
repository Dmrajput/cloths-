import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';
import Avatar from '../common/Avatar';

const { colors, typography, spacing, radius } = THEME;

function memberLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `Member since ${date.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`;
}

const OwnerCard = ({ owner, listingRating, reviewCount }) => {
  const name = owner?.name?.trim() || 'Pehenlo Member';
  const since = memberLabel(owner?.memberSince);
  const showListingRating = Number(reviewCount) > 0 && Number(listingRating) > 0;

  return (
    <View style={styles.card} accessibilityLabel={`Listed by ${name}`}>
      <Avatar uri={owner?.profileImage} name={name} size={52} />
      <View style={styles.copy}>
        <Text style={styles.name}>{name}</Text>
        {since ? <Text style={styles.meta}>{since}</Text> : null}
        {showListingRating ? (
          <Text style={styles.meta}>Listing rating ★ {Number(listingRating).toFixed(1)}</Text>
        ) : (
          <Text style={styles.meta}>No listing reviews yet</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  copy: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default OwnerCard;
