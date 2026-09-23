import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader, Avatar, Divider } from '../../components/common';
import { OutlineButton, TextButton } from '../../components/buttons';
import { SectionCard } from '../../components/cards';

const { colors, typography, spacing } = THEME;

const PROFILE_LINKS = [
  { label: 'Edit Profile', route: 'EditProfile' },
  { label: 'Wishlist', route: 'Wishlist' },
  { label: 'Earnings', route: 'Earnings' },
  { label: 'Help & Support', route: 'HelpSupport' },
];

const ProfileScreen = () => {
  const navigation = useNavigation();

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="Profile" showNotification onNotificationPress={() => {}} />

      <View style={styles.content}>
        <View style={styles.hero}>
          <Avatar name="Pehenlo User" size={72} />
          <Text style={styles.heading}>Profile</Text>
          <Text style={styles.body}>Your profile</Text>
        </View>

        <SectionCard title="Account" style={styles.card}>
          {PROFILE_LINKS.map((item, index) => (
            <View key={item.route}>
              {index > 0 ? <Divider /> : null}
              <TextButton
                title={item.label}
                onPress={() => navigation.navigate(item.route)}
                style={styles.link}
                textStyle={styles.linkText}
              />
            </View>
          ))}
        </SectionCard>

        <OutlineButton
          title="Sign Out"
          onPress={() => {}}
          disabled
          style={styles.signOut}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    marginBottom: spacing.xl,
  },
  link: {
    paddingVertical: spacing.md,
    paddingHorizontal: 0,
  },
  linkText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  signOut: {
    marginTop: spacing.sm,
  },
});

export default ProfileScreen;
