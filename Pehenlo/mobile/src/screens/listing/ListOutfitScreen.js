import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer } from '../../components/common';
import { OutlineButton, PrimaryButton } from '../../components/buttons';
import { useListingDraft } from '../../context/ListingDraftContext';
import { draftProgress, firstIncompleteRoute } from '../../utils/listingHelpers';

const { colors, typography, spacing, radius } = THEME;

const ListOutfitScreen = () => {
  const navigation = useNavigation();
  const { drafts, startNewDraft, continueDraft } = useListingDraft();
  const saved = drafts.filter((draft) => draft.title || draft.photos?.length || draft.id);

  const openNew = async () => {
    const begin = async () => {
      await startNewDraft();
      navigation.navigate('ListingPhotos');
    };
    if (!saved.length) {
      await begin();
      return;
    }
    Alert.alert(
      'Start a new listing?',
      'Your current draft will remain saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start New', onPress: begin },
      ]
    );
  };

  const openDraft = async (draft) => {
    await continueDraft(draft);
    navigation.navigate(firstIncompleteRoute(draft));
  };

  return (
    <ScreenContainer scroll edges={['top']}>
      <View style={styles.hero}>
        <Ionicons name="shirt-outline" size={36} color={colors.primary} />
      </View>
      <Text style={styles.title}>List your outfit</Text>
      <Text style={styles.body}>
        Add photos, price, and pickup details. Pehenlo reviews the listing before it appears in Explore.
      </Text>
      <PrimaryButton title="Start Listing" onPress={openNew} accessibilityLabel="Start listing" />

      {saved.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue a draft</Text>
          {saved.map((draft) => (
            <Pressable
              key={draft.localId}
              onPress={() => openDraft(draft)}
              accessibilityRole="button"
              accessibilityLabel={`Continue draft ${draft.title || 'Untitled listing'}`}
              style={styles.draft}
            >
              <View style={styles.draftCopy}>
                <Text style={styles.draftTitle}>{draft.title || 'Untitled listing'}</Text>
                <Text style={styles.draftMeta}>{draftProgress(draft)}% complete · {draft.status === 'REJECTED' ? 'Needs changes' : 'Draft'}</Text>
              </View>
              <Text style={styles.continue}>Continue</Text>
            </Pressable>
          ))}
          <OutlineButton
            title="Start New"
            onPress={openNew}
            style={styles.secondary}
            accessibilityLabel="Start a new listing"
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: 72,
    height: 72,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  draft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 72,
  },
  draftCopy: {
    flex: 1,
  },
  draftTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  draftMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  continue: {
    ...typography.label,
    color: colors.primary,
  },
  secondary: {
    marginTop: spacing.md,
  },
});

export default ListOutfitScreen;
