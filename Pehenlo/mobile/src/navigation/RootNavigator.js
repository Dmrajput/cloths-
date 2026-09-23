import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { THEME } from '../constants/theme';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: THEME.colors.background,
    card: THEME.colors.surface,
    text: THEME.colors.textPrimary,
    border: THEME.colors.border,
    primary: THEME.colors.primary,
  },
};

/**
 * RootNavigator
 * ├── AuthNavigator  (when not authenticated)
 * └── MainNavigator  (when authenticated)
 *
 * Phase 1 uses DEV_SHOW_MAIN_APP in AuthContext so MainNavigator is visible.
 */
export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
