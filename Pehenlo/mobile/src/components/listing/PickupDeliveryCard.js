import { StyleSheet, Text } from 'react-native';
import { THEME } from '../../constants/theme';

const { colors, typography, spacing } = THEME;

const PickupDeliveryCard = ({
  pickupAvailable,
  deliveryAvailable,
  city,
  pickupArea,
  availabilitySummary,
}) => {
  const place = [pickupArea, city].filter(Boolean).join(', ');
  return (
    <>
      {pickupAvailable ? <Text style={styles.line}>Pickup available{place ? ` · ${place}` : ''}</Text> : null}
      {deliveryAvailable ? <Text style={styles.line}>Delivery available</Text> : null}
      {!pickupAvailable && !deliveryAvailable ? <Text style={styles.muted}>Pickup and delivery details have not been added.</Text> : null}
      {availabilitySummary ? <Text style={styles.muted}>{availabilitySummary}</Text> : null}
    </>
  );
};

const styles = StyleSheet.create({
  line: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  muted: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default PickupDeliveryCard;
