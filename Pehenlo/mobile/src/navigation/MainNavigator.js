import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { THEME } from '../constants/theme';
import BottomTabNavigator from './BottomTabNavigator';
import OutfitDetailsScreen from '../screens/listing/OutfitDetailsScreen';
import EditOutfitScreen from '../screens/listing/EditOutfitScreen';
import MyListingsScreen from '../screens/listing/MyListingsScreen';
import AvailabilityScreen from '../screens/listing/AvailabilityScreen';
import BookingDetailsScreen from '../screens/rentals/BookingDetailsScreen';
import CheckoutScreen from '../screens/rentals/CheckoutScreen';
import PaymentScreen from '../screens/rentals/PaymentScreen';
import EarningsScreen from '../screens/earnings/EarningsScreen';
import TransactionHistoryScreen from '../screens/earnings/TransactionHistoryScreen';
import PayoutScreen from '../screens/earnings/PayoutScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import WishlistScreen from '../screens/profile/WishlistScreen';
import KYCVerificationScreen from '../screens/profile/KYCVerificationScreen';
import BankAccountScreen from '../screens/profile/BankAccountScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import NotificationSettingsScreen from '../screens/profile/NotificationSettingsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import SearchScreen from '../screens/explore/SearchScreen';
import FilterScreen from '../screens/explore/FilterScreen';

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
        options={{ title: 'My Listings' }}
      />
      <Stack.Screen
        name="Availability"
        component={AvailabilityScreen}
        options={{ title: 'Availability' }}
      />
      <Stack.Screen
        name="BookingDetails"
        component={BookingDetailsScreen}
        options={{ title: 'Booking Details' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
      <Stack.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: 'Earnings' }}
      />
      <Stack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{ title: 'Transactions' }}
      />
      <Stack.Screen
        name="Payout"
        component={PayoutScreen}
        options={{ title: 'Payout' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ title: 'Wishlist' }}
      />
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
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: 'Notifications' }}
      />
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
