import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { MAX_LISTING_PHOTOS } from '../../constants/listingConstants';
import ListingWizard from '../../components/listing/ListingWizard';
import ListingPhotoGrid from '../../components/listing/ListingPhotoGrid';
import ListingValidationMessage from '../../components/listing/ListingValidationMessage';
import { useListingDraft } from '../../context/ListingDraftContext';
import { uploadListingImage } from '../../services/uploadService';
import { validateListingPhotos } from '../../utils/listingValidation';

const { colors, typography, spacing } = THEME;

async function compress(uri, width) {
  return ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: Math.min(width || 1600, 1600) } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
}

const ListingPhotosScreen = () => {
  const navigation = useNavigation();
  const { activeDraft, updateDraft, syncDraft } = useListingDraft();
  const [error, setError] = useState('');
  const [uploadingLabel, setUploadingLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const photos = activeDraft?.photos || [];

  const addAssets = async (assets) => {
    const room = MAX_LISTING_PHOTOS - photos.length;
    if (room <= 0) {
      setError('You can add up to 8 photos.');
      return;
    }
    const selected = assets.slice(0, room);
    if (assets.length > room) setError('Only the first photos that fit the 8 photo limit were added.');
    else setError('');
    const prepared = [];
    for (const asset of selected) {
      try {
        const compressed = await compress(asset.uri, asset.width);
        prepared.push({ localUri: compressed.uri, url: '', publicId: '', error: '' });
      } catch (_error) {
        setError('One photo could not be prepared. Try another image.');
      }
    }
    await updateDraft({ photos: [...photos, ...prepared] });
  };

  const pickLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photos permission needed', 'Allow photo access to add outfit pictures.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_LISTING_PHOTOS - photos.length,
      quality: 0.8,
    });
    if (result.canceled) return;
    await addAssets(result.assets || []);
  };

  const pickCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Allow camera access to photograph the outfit.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;
    await addAssets(result.assets || []);
  };

  const chooseSource = () => {
    Alert.alert('Add photo', 'Choose a clear photo of the outfit.', [
      { text: 'Photo library', onPress: pickLibrary },
      { text: 'Camera', onPress: pickCamera },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const move = async (index, direction) => {
    const next = [...photos];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    await updateDraft({ photos: next });
  };

  const setCover = async (index) => {
    const next = [...photos];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    await updateDraft({ photos: next });
  };

  const remove = async (index) => {
    await updateDraft({ photos: photos.filter((_, itemIndex) => itemIndex !== index) });
  };

  const uploadPending = async (current) => {
    const next = [...current];
    const pendingIndexes = next
      .map((photo, index) => (!photo.url ? index : -1))
      .filter((index) => index >= 0);
    for (let position = 0; position < pendingIndexes.length; position += 1) {
      const index = pendingIndexes[position];
      setUploadingLabel(`Uploading ${position + 1} of ${pendingIndexes.length}`);
      next[index] = { ...next[index], uploading: true, error: '' };
      await updateDraft({ photos: [...next] });
      try {
        const image = await uploadListingImage(next[index].localUri);
        next[index] = {
          ...next[index],
          url: image.url,
          publicId: image.publicId,
          uploading: false,
          error: '',
        };
      } catch (uploadError) {
        next[index] = { ...next[index], uploading: false, error: uploadError.message };
        await updateDraft({ photos: [...next] });
        throw uploadError;
      }
    }
    await updateDraft({ photos: next });
    return next;
  };

  const retry = async (index) => {
    const next = [...photos];
    next[index] = { ...next[index], error: '', uploading: true };
    await updateDraft({ photos: next });
    try {
      const image = await uploadListingImage(next[index].localUri);
      next[index] = { ...next[index], url: image.url, publicId: image.publicId, uploading: false };
      await updateDraft({ photos: next });
    } catch (uploadError) {
      next[index] = { ...next[index], uploading: false, error: uploadError.message };
      await updateDraft({ photos: next });
      setError(uploadError.message);
    }
  };

  const continueStep = async () => {
    const validation = validateListingPhotos(activeDraft);
    if (!validation.ok) {
      setError(validation.errors.photos);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const uploaded = await uploadPending(photos);
      if (uploaded.some((photo) => !photo.url)) {
        setError('Photo upload failed');
        return;
      }
      await syncDraft({ photos: uploaded });
      navigation.navigate('ListingDetails');
    } catch (saveError) {
      setError(saveError.message || 'Photo upload failed');
    } finally {
      setSaving(false);
      setUploadingLabel('');
    }
  };

  return (
    <ListingWizard
      step={1}
      title="Add photos"
      subtitle="Show the outfit clearly. The first photo is the cover."
      onContinue={continueStep}
      loading={saving}
      continueLabel={uploadingLabel || 'Continue'}
    >
      <ListingPhotoGrid
        photos={photos}
        onAdd={chooseSource}
        onRemove={remove}
        onMove={move}
        onSetCover={setCover}
        onRetry={retry}
      />
      <View style={styles.actions}>
        <Pressable onPress={pickCamera} accessibilityRole="button" accessibilityLabel="Take a photo" style={styles.link}>
          <Text style={styles.linkText}>Use camera</Text>
        </Pressable>
      </View>
      <ListingValidationMessage message={error} />
      <Text style={styles.guideTitle}>For better bookings</Text>
      <Text style={styles.guide}>Use clear photos, show the front and back, use good lighting, and show embroidery or details. Avoid heavy filters.</Text>
      <Text style={styles.guide}>1 photo is required. 4 or 5 photos work best. Maximum 8.</Text>
    </ListingWizard>
  );
};

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing.md,
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    ...typography.label,
    color: colors.primary,
  },
  guideTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  guide: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});

export default ListingPhotosScreen;
