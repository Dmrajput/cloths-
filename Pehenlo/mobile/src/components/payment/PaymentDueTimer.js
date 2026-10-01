import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { THEME } from '../../constants/theme';
import { countdownLabel } from '../../utils/bookingHelpers';

const { colors, typography, spacing } = THEME;

const PaymentDueTimer = ({ dueAt, onExpire }) => {
  const [now, setNow] = useState(Date.now());
  const fired = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!dueAt || fired.current) return;
    if (new Date(dueAt).getTime() <= now) {
      fired.current = true;
      if (onExpire) onExpire();
    }
  }, [dueAt, now, onExpire]);

  if (!dueAt) return null;
  return <Text style={styles.timer}>Payment expires in {countdownLabel(dueAt, now)}</Text>;
};

const styles = StyleSheet.create({
  timer: {
    ...typography.label,
    color: colors.primary,
    marginTop: spacing.md,
  },
});

export default PaymentDueTimer;
