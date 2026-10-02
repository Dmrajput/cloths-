import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { THEME } from '../constants/theme';
import BottomTabNavigator from './BottomTabNavigator';
import OutfitDetailsScreen from '../screens/listing/OutfitDetailsScreen';
import EditOutfitScreen from '../screens/listing/EditOutfitScreen';
import MyListingsScreen from '../screens/listing/MyListingsScreen';
import AvailabilityScreen from '../screens/booking/AvailabilityScreen';
import CreateBookingScreen from '../screens/booking/CreateBookingScreen';
import BookingDetailsScreen from '../screens/booking/BookingDetailsScreen';
import OwnerBookingRequestsScreen from '../screens/booking/OwnerBookingRequestsScreen';
import CheckoutScreen from '../screens/rentals/CheckoutScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import PaymentResultScreen from '../screens/payment/PaymentResultScreen';
import MyEarningsScreen from '../screens/earnings/MyEarningsScreen';
import EarningDetailsScreen from '../screens/earnings/EarningDetailsScreen';
import WithdrawScreen from '../screens/earnings/WithdrawScreen';
import PayoutHistoryScreen from '../screens/earnings/PayoutHistoryScreen';
import PayoutDetailsScreen from '../screens/earnings/PayoutDetailsScreen';
import PayoutAccountScreen from '../screens/earnings/PayoutAccountScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';
import WriteReviewScreen from '../screens/reviews/WriteReviewScreen';
import ReviewsScreen from '../screens/reviews/ReviewsScreen';
import SafetyCenterScreen from '../screens/safety/SafetyCenterScreen';
import ReportScreen from '../screens/safety/ReportScreen';
import BlockedUsersScreen from '../screens/safety/BlockedUsersScreen';
import KYCVerificationScreen from '../screens/profile/KYCVerificationScreen';
import BankAccountScreen from '../screens/profile/BankAccountScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import NotificationPreferencesScreen from '../screens/notifications/NotificationPreferencesScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import SearchScreen from '../screens/explore/SearchScreen';
import FilterScreen from '../screens/explore/FilterScreen';
import ListingPhotosScreen from '../screens/listing/ListingPhotosScreen';
import ListingDetailsScreen from '../screens/listing/ListingDetailsScreen';
import ListingMeasurementsScreen from '../screens/listing/ListingMeasurementsScreen';
import ListingPricingScreen from '../screens/listing/ListingPricingScreen';
import ListingAvailabilityScreen from '../screens/listing/ListingAvailabilityScreen';
import ListingDeliveryScreen from '../screens/listing/ListingDeliveryScreen';
import ListingReviewScreen from '../screens/listing/ListingReviewScreen';
import ListingSuccessScreen from '../screens/listing/ListingSuccessScreen';

const Stack = createNativeStackNavigator();
const { colors, typography } = THEME;


const screenOptions = {
  headerStyle: {
    backgroundColor: colors.background,
  },
  headerTintColor: colors.primary,
  headerTitleStyle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: colors.background,
  },
};

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ListingPhotos" component={ListingPhotosScreen} options={{ title: 'Photos' }} />
      <Stack.Screen name="ListingDetails" component={ListingDetailsScreen} options={{ title: 'Details' }} />
      <Stack.Screen name="ListingMeasurements" component={ListingMeasurementsScreen} options={{ title: 'Condition' }} />
      <Stack.Screen name="ListingPricing" component={ListingPricingScreen} options={{ title: 'Pricing' }} />
      <Stack.Screen name="ListingAvailability" component={ListingAvailabilityScreen} options={{ title: 'Availability' }} />
      <Stack.Screen name="ListingDelivery" component={ListingDeliveryScreen} options={{ title: 'Delivery' }} />
      <Stack.Screen name="ListingReview" component={ListingReviewScreen} options={{ title: 'Review' }} />
      <Stack.Screen name="ListingSuccess" component={ListingSuccessScreen} options={{ title: 'Submitted', headerBackVisible: false }} />
      <Stack.Screen
        name="OutfitDetails"
        component={OutfitDetailsScreen}
        options={{ title: 'Outfit Details' }}
      />
      <Stack.Screen
        name="EditOutfit"
        component={EditOutfitScreen}
        options={{ title: 'Edit Outfit' }}
      />
      <Stack.Screen
        name="MyListings"
        component={MyListingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Availability"
        component={AvailabilityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateBooking"
        component={CreateBookingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingDetails"
        component={BookingDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OwnerBookingRequests"
        component={OwnerBookingRequestsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentResult"
        component={PaymentResultScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Earnings" component={MyEarningsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EarningDetails" component={EarningDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PayoutHistory" component={PayoutHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PayoutDetails" component={PayoutDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PayoutAccount" component={PayoutAccountScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SafetyCenter" component={SafetyCenterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Report" component={ReportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="KYCVerification"
        component={KYCVerificationScreen}
        options={{ title: 'KYC Verification' }}
      />
      <Stack.Screen
        name="BankAccount"
        component={BankAccountScreen}
        options={{ title: 'Bank Account' }}
      />
      <Stack.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{ title: 'Addresses' }}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: 'Help & Support' }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Search' }}
      />
      <Stack.Screen
        name="Filter"
        component={FilterScreen}
        options={{ title: 'Filters' }}
      />
    </Stack.Navigator>
  );
}
