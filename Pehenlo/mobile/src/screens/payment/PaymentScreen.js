import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import PaymentSummary from '../../components/payment/PaymentSummary';
import PaymentDueTimer from '../../components/payment/PaymentDueTimer';
import PaymentMethodInfo from '../../components/payment/PaymentMethodInfo';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { ErrorState } from '../../components/common';
import { formatDisplayDate } from '../../utils/bookingHelpers';
import { bookingErrorMessage } from '../../utils/bookingErrors';
import { canRetryPayment, formatINR, paymentResultState } from '../../utils/paymentHelpers';

const { colors, typography, spacing } = THEME;

function checkoutHtml(order) {
  const payload = JSON.stringify({
    key: order.razorpayKeyId,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: 'Pehenlo',
    description: order.description || 'Outfit rental',
    order_id: order.razorpayOrderId,
    prefill: {
      name: order.name || '',
      contact: order.contact || '',
    },
  }).replace(/</g, '\\u003c');
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
var options = ${payload};
options.handler = function (response) {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', ...response }));
};
options.modal = { ondismiss: function () { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dismissed' })); } };
var checkout = new Razorpay(options);
checkout.on('payment.failed', function (response) {
  var error = response && response.error ? response.error : {};
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'failed', description: error.description || '' }));
});
checkout.open();
</script></body></html>`;
}

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const bookingId = route.params?.bookingId;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [checkout, setCheckout] = useState(null);

  const load = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      setError('This booking could not be found.');
      return;
    }
    setError('');
    try {
      const response = await bookingService.getBookingById(bookingId);
      const next = response?.data?.booking || null;
      setBooking(next);
      if (paymentResultState(next) === 'SUCCESS') {
        navigation.replace('PaymentResult', { bookingId });
      }
    } catch (loadError) {
      setError(bookingErrorMessage(loadError, 'Unable to load payment details.'));
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    const response = await bookingService.getBookingById(bookingId);
    const next = response?.data?.booking || null;
    setBooking(next);
    return next;
  };

  const finishFromServer = async () => {
    const next = await refresh();
    const state = paymentResultState(next);
    if (state === 'SUCCESS' || state === 'EXPIRED' || state === 'FAILED' || state === 'PENDING') {
      if (state !== 'FAILED' && state !== 'PENDING') {
        navigation.replace('PaymentResult', { bookingId });
        return;
      }
      if (next?.paymentStatus === 'PROCESSING' || next?.paymentStatus === 'PAID') {
        navigation.replace('PaymentResult', { bookingId });
      }
    }
  };

  const onCheckoutMessage = async (event) => {
    let message = {};
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch (_error) {
      message = { type: 'dismissed' };
    }
    setCheckout(null);
    setPaying(true);
    try {
      if (message.type === 'success') {
        try {
          await paymentService.verifyPayment({
            bookingId,
            razorpayOrderId: message.razorpay_order_id,
            razorpayPaymentId: message.razorpay_payment_id,
            razorpaySignature: message.razorpay_signature,
          });
        } catch (verifyError) {
          setFormError(bookingErrorMessage(verifyError, 'Payment verification is still pending. Check the booking again in a moment.'));
        }
      }
      const next = await refresh();
      const state = paymentResultState(next);
      if (state === 'SUCCESS' || state === 'EXPIRED' || (message.type === 'success' && state !== 'FAILED')) {
        navigation.replace('PaymentResult', { bookingId });
        return;
      }
      if (message.type === 'failed' && state === 'FAILED') {
        navigation.replace('PaymentResult', { bookingId });
        return;
      }
      if (message.type === 'failed') {
        setFormError('Payment was not completed. You can try again while the window is open.');
      }
    } catch (verifyError) {
      setFormError(bookingErrorMessage(verifyError, 'Payment verification is still pending. Check the booking again in a moment.'));
    } finally {
      setPaying(false);
    }
  };

  const pay = async () => {
    setPaying(true);
    setFormError('');
    try {
      const response = await paymentService.createPaymentOrder(bookingId);
      const order = response?.data?.payment;
      if (!order?.razorpayOrderId || !order?.razorpayKeyId) {
        throw new Error('Missing order');
      }
      setCheckout(order);
    } catch (payError) {
      setFormError(bookingErrorMessage(payError, 'Payment could not be started.'));
      await refresh().catch(() => {});
    } finally {
      setPaying(false);
    }
  };

  const payable = canRetryPayment(booking);

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.header}>Complete payment</Text>
        <View style={styles.back} />
      </View>
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {!loading && error ? <ErrorState title="Unable to load payment" message={error} onActionPress={load} /> : null}
      {!loading && booking ? (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.outfit}>
              {booking.outfit?.coverImage ? <Image source={{ uri: booking.outfit.coverImage }} style={styles.image} /> : <View style={styles.image} />}
              <View style={styles.copy}>
                <Text style={styles.title}>{booking.outfit?.title}</Text>
                <Text style={styles.meta}>{formatDisplayDate(booking.startDate)} – {formatDisplayDate(booking.endDate)}</Text>
                <Text style={styles.meta}>{booking.rentalDays} day{booking.rentalDays === 1 ? '' : 's'}</Text>
              </View>
            </View>
            <PaymentSummary booking={booking} />
            <PaymentMethodInfo />
            <Text style={styles.deadline}>Complete payment within the time shown. The outfit stays reserved until then.</Text>
            {payable ? <PaymentDueTimer dueAt={booking.paymentDueAt} onExpire={finishFromServer} /> : null}
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            {payable ? (
              <PrimaryButton title={`Pay ${formatINR(booking.totalIncludingDeposit)}`} onPress={pay} loading={paying} accessibilityLabel="Pay now" />
            ) : (
              <Text style={styles.closed}>{booking.paymentStatus === 'PAID' ? 'Payment received' : 'Payment is no longer available'}</Text>
            )}
          </View>
        </>
      ) : null}
      <Modal visible={Boolean(checkout)} animationType="slide" onRequestClose={() => setCheckout(null)}>
        <View style={[styles.checkout, { paddingTop: insets.top }]}>
          <Pressable onPress={() => { setCheckout(null); refresh(); }} accessibilityRole="button" accessibilityLabel="Close payment" style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          {checkout ? (
            <WebView
              originWhitelist={['*']}
              source={{ html: checkoutHtml(checkout) }}
              onMessage={onCheckoutMessage}
              javaScriptEnabled
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.sm },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { ...typography.h2, color: colors.textPrimary },
  header: { ...typography.h3, color: colors.textPrimary },
  loader: { marginTop: spacing.xl },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  outfit: { flexDirection: 'row' },
  image: { width: 84, height: 104, borderRadius: 12, backgroundColor: colors.surfaceSecondary },
  copy: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.h3, color: colors.textPrimary },
  meta: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  deadline: { ...typography.body, color: colors.textSecondary, marginTop: spacing.lg },
  formError: { ...typography.body, color: colors.error, marginTop: spacing.md },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  closed: { ...typography.body, color: colors.textSecondary, textAlign: 'center', minHeight: 48 },
  checkout: { flex: 1, backgroundColor: colors.background },
  close: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.lg },
  closeText: { ...typography.label, color: colors.primary },
});

export default PaymentScreen;
