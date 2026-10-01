import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { THEME } from '../constants/theme';
import { bookingService } from '../services/bookingService';
import HomeScreen from '../screens/home/HomeScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import ListOutfitScreen from '../screens/listing/ListOutfitScreen';
import MyRentalsScreen from '../screens/rentals/MyRentalsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const { colors, typography, spacing, radius, shadows } = THEME;

const TAB_ICONS = {
  Home: { active: 'home', inactive: 'home-outline' },
  Explore: { active: 'search', inactive: 'search-outline' },
  ListOutfit: { active: 'add', inactive: 'add' },
  MyRentals: { active: 'cube', inactive: 'cube-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function ListOutfitTabIcon({ focused }) {
  return (
    <View style={[styles.listFab, focused && styles.listFabFocused]}>
      <Ionicons name="add" size={28} color={colors.textLight} />
    </View>
  );
}

function TabBarIcon({ routeName, focused, color, size }) {
  if (routeName === 'ListOutfit') {
    return <ListOutfitTabIcon focused={focused} />;
  }

  const icons = TAB_ICONS[routeName] || { active: 'ellipse', inactive: 'ellipse-outline' };
  return (
    <Ionicons
      name={focused ? icons.active : icons.inactive}
      size={size}
      color={color}
    />
  );
}

export default function BottomTabNavigator() {
  const [actionable, setActionable] = useState(0);
  const loadCounts = useCallback(async () => {
    try {
      const response = await bookingService.getRentalCounts();
      setActionable(Number(response?.data?.actionable) || 0);
    } catch (_error) {
      setActionable(0);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadCounts();
  }, [loadCounts]));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          ...typography.caption,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon
            routeName={route.name}
            focused={focused}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarAccessibilityLabel: 'Home' }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarLabel: 'Explore', tabBarAccessibilityLabel: 'Explore' }}
      />
      <Tab.Screen
        name="ListOutfit"
        component={ListOutfitScreen}
        options={{
          tabBarLabel: 'List',
          tabBarAccessibilityLabel: 'List Outfit',
        }}
      />
      <Tab.Screen
        name="MyRentals"
        component={MyRentalsScreen}
        options={{
          tabBarLabel: 'My Rentals',
          tabBarAccessibilityLabel: 'My Rentals',
          tabBarBadge: actionable > 0 ? actionable : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
        listeners={{ focus: loadCounts }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarAccessibilityLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.xs,
    height: 64,
    ...shadows.small,
  },
  listFab: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  listFabFocused: {
    backgroundColor: colors.primaryDark,
  },
});
