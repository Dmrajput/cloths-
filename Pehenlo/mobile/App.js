import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import { THEME } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaProvider style={styles.root}>
      <AuthProvider>
        <UserProvider>
          <AppProvider>
            <StatusBar style="dark" backgroundColor={THEME.colors.background} />
            <RootNavigator />
          </AppProvider>
        </UserProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
});
