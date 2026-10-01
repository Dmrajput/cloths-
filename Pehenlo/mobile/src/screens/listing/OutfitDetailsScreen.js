import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { genderLabel, occasionLabel } from '../../constants/listingConstants';
import { listingService } from '../../services/listingService';
import { useAuth } from '../../hooks/useAuth';
import ListingImageGallery from '../../components/listing/ListingImageGallery';
import ListingHeader from '../../components/listing/ListingHeader';
import RentalPriceCard from '../../components/listing/RentalPriceCard';
import ListingInfoSection from '../../components/listing/ListingInfoSection';
import MeasurementTable from '../../components/listing/MeasurementTable';
import ConditionCard from '../../components/listing/ConditionCard';
import PickupDeliveryCard from '../../components/listing/PickupDeliveryCard';
import OwnerCard from '../../components/listing/OwnerCard';
import SimilarListings from '../../components/listing/SimilarListings';
import StickyListingCTA from '../../components/listing/StickyListingCTA';

const { colors, typography, spacing, radius } = THEME;

const OCCASION_EXPLORE = {
  WEDDING: 'wedding',
  ENGAGEMENT: 'engagement',
  HALDI: 'haldi',
  MEHENDI: 'mehendi',
  RECEPTION: 'reception',
  NAVRATRI: 'navratri',
  GARBA: 'garba',
  FESTIVAL: 'festival',
  PARTY: 'party',
  TRADITIONAL_FUNCTION: 'traditional-day',
};

function listedLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `Listed in ${date.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`;
}

const OutfitDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isAuthenticated } = useAuth();
  const listingId = route.params?.listingId;
  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const trackedId = useRef(null);

  const load = async () => {
    if (!listingId) {
      setLoading(false);
      setUnavailable(true);
      setListing(null);
      return;
    }
    setLoading(true);
    setError('');
    setUnavailable(false);
    setExpanded(false);
    try {
      const response = await listingService.getListingById(listingId);
      setListing(response?.data?.listing || null);
    } catch (loadError) {
      if ((loadError.status === 404 || loadError.status === 400) && isAuthenticated) {
        try {
          const mine = await listingService.getMyListing(listingId);
          setListing(mine?.data?.listing || null);
          setLoading(false);
          return;
        } catch (_ownerError) {
          setListing(null);
          setUnavailable(true);
          setLoading(false);
          return;
        }
      }
      if (loadError.status === 404 || loadError.status === 400) {
        setListing(null);
        setUnavailable(true);
      } else if (loadError.code === 'NETWORK_ERROR') {
        setError('Couldn’t load this outfit. Check your internet connection and try again.');
      } else {
        setError('Unable to load outfit. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [listingId]);

  useEffect(() => {
    if (!listing?.id || listing.viewerIsOwner || (listing.status && listing.status !== 'ACTIVE')) return undefined;
    if (trackedId.current === listing.id) return undefined;
    trackedId.current = listing.id;
    listingService.trackListingView(listing.id).catch(() => {});
    return undefined;
  }, [listing?.id, listing?.viewerIsOwner, listing?.status]);

  useEffect(() => {
    if (!listing?.id || (listing.status && listing.status !== 'ACTIVE')) {
      setSimilar([]);
      return undefined;
    }
    let active = true;
    listingService.getSimilarListings(listing.id)
      .then((response) => {
        if (active) setSimilar(response?.data?.items || []);
      })
      .catch(() => {
        if (active) setSimilar([]);
      });
    return () => {
      active = false;
    };
  }, [listing?.id, listing?.status]);

  const openExplore = (params) => {
    navigation.navigate('MainTabs', {
      screen: 'Explore',
      params: { ...params, navToken: Date.now() },
    });
  };

  const shareListing = async () => {
    if (!listing) return;
    const place = [listing.city, listing.state].filter(Boolean).join(', ');
    await Share.share({
      message: [listing.title, place].filter(Boolean).join(' · '),
    });
  };

  const description = listing?.description || '';
  const longDescription = description.length > 180;
  const shownDescription = expanded || !longDescription ? description : `${description.slice(0, 180).trim()}…`;
  const isOwner = Boolean(listing?.viewerIsOwner);
  const isPublic = !listing?.status || listing.status === 'ACTIVE';

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.topActions}>
          <Pressable
            onPress={() => Alert.alert('Saved outfits', 'Saving outfits will be available in a later update.')}
            accessibilityRole="button"
            accessibilityLabel="Favorite"
            style={styles.iconButton}
          >
            <Ionicons name="heart-outline" size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={shareListing} accessibilityRole="button" accessibilityLabel="Share" style={styles.iconButton}>
            <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.pad}>
          <View style={[styles.skeleton, { height: width * 0.9 }]} />
          <View style={[styles.line, { width: '70%' }]} />
          <View style={[styles.line, { width: '40%' }]} />
          <View style={[styles.line, { width: '90%' }]} />
        </View>
      ) : null}

      {!loading && unavailable ? (
        <View style={styles.message}>
          <Text style={styles.messageTitle}>Outfit not available</Text>
          <Text style={styles.messageBody}>This outfit may have been removed or is no longer available.</Text>
          <Pressable onPress={() => openExplore({})} accessibilityRole="button" accessibilityLabel="Back to Explore" style={styles.messageButton}>
            <Text style={styles.messageButtonText}>Back to Explore</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.message}>
          <Text style={styles.messageTitle}>Unable to load outfit</Text>
          <Text style={styles.messageBody}>{error}</Text>
          <Pressable onPress={load} accessibilityRole="button" accessibilityLabel="Retry" style={styles.messageButton}>
            <Text style={styles.messageButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && listing ? (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ListingImageGallery images={listing.images?.length ? listing.images : [{ url: listing.coverImage }]} width={width} />
            <View style={styles.pad}>
              {!isPublic ? (
                <Text style={styles.banner}>Your listing is not public yet.</Text>
              ) : null}
              <ListingHeader
                title={listing.title}
                rating={listing.rating}
                reviewCount={listing.reviewCount}
                city={listing.city}
                state={listing.state}
                onCityPress={listing.city ? () => openExplore({ city: listing.city }) : undefined}
              />
              <RentalPriceCard
                price={listing.price}
                durationLabel={listing.rentalDuration || 'the rental period'}
                securityDeposit={listing.securityDeposit}
                cleaningFee={listing.cleaningFee}
              />

              {description ? (
                <ListingInfoSection title="About this outfit">
                  <Text style={styles.body}>{shownDescription}</Text>
                  {longDescription ? (
                    <Pressable onPress={() => setExpanded((value) => !value)} accessibilityRole="button" accessibilityLabel={expanded ? 'Show less' : 'Show more'}>
                      <Text style={styles.link}>{expanded ? 'Show less' : 'Show more'}</Text>
                    </Pressable>
                  ) : null}
                </ListingInfoSection>
              ) : null}

              <ListingInfoSection title="Details">
                {listing.category?.name ? (
                  <Pressable
                    onPress={() => openExplore({ category: listing.category.slug, categoryName: listing.category.name })}
                    accessibilityRole="button"
                    accessibilityLabel={`Category ${listing.category.name}`}
                    style={styles.detailRow}
                  >
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.link}>{listing.category.name}</Text>
                  </Pressable>
                ) : null}
                {listing.gender ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>For</Text>
                    <Text style={styles.detailValue}>{genderLabel(listing.gender) || listing.gender}</Text>
                  </View>
                ) : null}
                {listing.brand ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Brand</Text>
                    <Text style={styles.detailValue}>{listing.brand}</Text>
                  </View>
                ) : null}
                {listing.color ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Color</Text>
                    <Text style={styles.detailValue}>{listing.color}</Text>
                  </View>
                ) : null}
              </ListingInfoSection>

              {listing.occasion?.length ? (
                <ListingInfoSection title="Perfect for">
                  <View style={styles.chips}>
                    {listing.occasion.map((value) => {
                      const exploreId = OCCASION_EXPLORE[value];
                      return (
                        <Pressable
                          key={value}
                          disabled={!exploreId}
                          onPress={exploreId ? () => openExplore({ occasion: exploreId }) : undefined}
                          accessibilityRole="button"
                          accessibilityLabel={occasionLabel(value)}
                          style={styles.chip}
                        >
                          <Text style={styles.chipText}>{occasionLabel(value)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ListingInfoSection>
              ) : null}

              <ListingInfoSection title="Size and fit">
                {listing.size ? <Text style={styles.body}>Size {listing.size}</Text> : null}
                <MeasurementTable measurements={listing.measurements} />
                <Text style={styles.disclaimer}>Measurements are provided by the owner. Please compare them with your own measurements before booking.</Text>
              </ListingInfoSection>

              <ListingInfoSection title="Condition">
                <ConditionCard
                  condition={listing.condition}
                  notes={listing.conditionNotes}
                  hasDamage={listing.hasDamage}
                  damageDescription={listing.damageDescription}
                />
              </ListingInfoSection>

              <ListingInfoSection title="Pickup and delivery">
                <PickupDeliveryCard
                  pickupAvailable={listing.pickupAvailable}
                  deliveryAvailable={listing.deliveryAvailable}
                  city={listing.city}
                  pickupArea={listing.pickupArea}
                  availabilitySummary={listing.availabilitySummary}
                />
                {Number(listing.deliveryFee) > 0 ? (
                  <Text style={styles.disclaimer}>Delivery fee ₹{Number(listing.deliveryFee).toLocaleString('en-IN')}</Text>
                ) : null}
              </ListingInfoSection>

              <ListingInfoSection title="About the owner">
                <OwnerCard owner={listing.owner} listingRating={listing.rating} reviewCount={listing.reviewCount} />
              </ListingInfoSection>

              <ListingInfoSection title="Before you rent">
                <Text style={styles.body}>Condition details are shared by the owner.</Text>
                <Text style={styles.body}>Only active outfits appear in Explore.</Text>
              </ListingInfoSection>

              {listedLabel(listing.createdAt) ? <Text style={styles.listed}>{listedLabel(listing.createdAt)}</Text> : null}

              <SimilarListings
                listings={similar}
                onPress={(item) => {
                  if (item.id === listing.id) return;
                  navigation.push('OutfitDetails', { listingId: item.id });
                }}
              />
            </View>
          </ScrollView>
          <StickyListingCTA
            price={listing.price}
            durationLabel={listing.rentalDuration || 'rental'}
            isOwner={isOwner || !isPublic}
            onPress={() => navigation.navigate('Availability', { listingId: listing.id })}
          />
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  topActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: spacing.xl,
  },
  pad: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  skeleton: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  line: {
    height: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    marginBottom: spacing.sm,
  },
  banner: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  link: {
    ...typography.label,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.label,
    color: colors.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipText: {
    ...typography.label,
    color: colors.primary,
  },
  disclaimer: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  listed: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  message: {
    padding: spacing.lg,
  },
  messageTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  messageBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  messageButton: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    ...typography.button,
    color: colors.textLight,
  },
});

export default OutfitDetailsScreen;
