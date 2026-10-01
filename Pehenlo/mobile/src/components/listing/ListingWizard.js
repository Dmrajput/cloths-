import { useLayoutEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer } from '../common';
import { PrimaryButton, TextButton } from '../buttons';
import ListingProgress from './ListingProgress';
import { useListingDraft } from '../../context/ListingDraftContext';

const { colors, typography, spacing } = THEME;

const ListingWizard = ({
  step,
  title,
  subtitle,
  children,
  onContinue,
  continueLabel = 'Continue',
  loading = false,
}) => {
  const navigation = useNavigation();
  const { syncDraft } = useListingDraft();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'List Outfit',
      headerRight: () => (
        <TextButton
          title="Close"
          accessibilityLabel="Close listing"
          onPress={() => {
            Alert.alert(
              'Save your progress?',
              'Your listing will be saved as a draft.',
              [
                { text: 'Continue Editing', style: 'cancel' },
                {
                  text: 'Discard',
                  style: 'destructive',
                  onPress: () => navigation.navigate('MainTabs', { screen: 'ListOutfit' }),
                },
                {
                  text: 'Save Draft',
                  onPress: async () => {
                    try {
                      await syncDraft();
                    } catch (_error) {
                      Alert.alert('Saved on this phone', 'We couldn’t reach Pehenlo. Your draft is still here.');
                    }
                    navigation.navigate('MainTabs', { screen: 'ListOutfit' });
                  },
                },
              ]
            );
          }}
        />
      ),
    });
  }, [navigation, syncDraft]);

  return (
    <ScreenContainer padded={false} edges={['bottom']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ListingProgress step={step} />
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          title={continueLabel}
          onPress={onContinue}
          loading={loading}
          accessibilityLabel={continueLabel}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
});

export default ListingWizard;
