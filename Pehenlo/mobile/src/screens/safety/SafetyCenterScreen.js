import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';
import { SAFETY_SECTIONS } from '../../constants/safetyConstants';

const { colors, typography, spacing, radius } = THEME;

const SafetyCenterScreen = () => {
  const navigation = useNavigation();

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="Trust & Safety" showBack onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.intro}>
          Keep bookings and payments inside Pehenlo. These notes explain how rentals, reports, and account safety work. They are not a guarantee.
        </Text>
        {SAFETY_SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.bodyText}>{section.body}</Text>
          </View>
        ))}
        <Pressable onPress={() => navigation.navigate('BlockedUsers')} accessibilityRole="button" accessibilityLabel="Blocked users" style={styles.link}>
          <Text style={styles.linkText}>Blocked users</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.sm },
  intro: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  title: { ...typography.h3, color: colors.primary, marginBottom: spacing.xs },
  bodyText: { ...typography.body, color: colors.textSecondary },
  link: { minHeight: 44, justifyContent: 'center' },
  linkText: { ...typography.body, color: colors.primary, fontWeight: '600' },
});

export default SafetyCenterScreen;
