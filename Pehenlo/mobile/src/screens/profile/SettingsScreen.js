import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

const { colors, typography, spacing, radius } = THEME;

function Row({ label, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will need to sign in again to see your profile and wishlist.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete account?',
      'Deleting your account may affect access to your profile and future marketplace activity. Booking and payout records are kept. Your listings will no longer be bookable.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Confirm deactivation', 'Your profile will be deactivated. This does not erase financial history.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Deactivate account',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await userService.requestAccountDeletion();
                    await logout();
                  } catch (error) {
                    Alert.alert('Could not deactivate account', error.message || 'Please try again.');
                  }
                },
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="Settings" showBack onBack={() => navigation.goBack()} />
      <View style={styles.list}>
        <Row label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
        <Row label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
        <Row label="Terms & Conditions" onPress={() => navigation.navigate('Terms')} />
        <Row label="Trust & Safety" onPress={() => navigation.navigate('SafetyCenter')} />
        <Row label="Help / Support" onPress={() => navigation.navigate('HelpSupport')} />
        <Row label="Logout" onPress={confirmLogout} />
        <Pressable onPress={confirmDelete} accessibilityRole="button" accessibilityLabel="Delete Account" style={styles.delete}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.sm },
  row: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: { ...typography.body, color: colors.textPrimary, flex: 1 },
  delete: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  deleteText: { ...typography.body, color: colors.error, fontWeight: '600' },
});

export default SettingsScreen;
