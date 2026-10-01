import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { THEME } from '../constants/theme';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

const ProfileStack = createNativeStackNavigator();
const { colors } = THEME;

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: THEME.colors.surface,
    text: THEME.colors.textPrimary,
    border: THEME.colors.border,
    primary: colors.primary,
  },
};

function ProfileSetupNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <ProfileStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </ProfileStack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading, user, sessionError, refreshSession } = useAuth();
  const needsProfile = isAuthenticated && user && !user.isProfileCompleted;

  if (isLoading || sessionError) {
    return <SplashScreen sessionError={sessionError} onRetry={refreshSession} />;
  }

  let navigator = <AuthNavigator />;
  if (needsProfile) {
    navigator = <ProfileSetupNavigator />;
  } else if (isAuthenticated) {
    navigator = <MainNavigator />;
  }

  return <NavigationContainer theme={navTheme}>{navigator}</NavigationContainer>;
}
