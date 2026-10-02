import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../constants/theme';
import { ScreenContainer, AppHeader } from '../../components/common';
import { AppInput, AppTextArea } from '../../components/inputs';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

const { colors, typography, spacing, radius } = THEME;

const GENDERS = [
  { label: 'Not set', value: '' },
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || '');
  const [stateName, setStateName] = useState(user?.state || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photo, setPhoto] = useState(user?.profileImage || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const applyUser = (next) => {
    if (next) setUser(next);
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photos permission needed', 'Allow photo access to update your profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setSaving(true);
    setError('');
    try {
      const data = await userService.uploadProfileImage(result.assets[0].uri);
      setPhoto(data.profileImage || data.user?.profileImage || '');
      applyUser(data.user);
    } catch (uploadError) {
      setError(uploadError.message || 'Photo upload failed');
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await userService.removeProfileImage();
      setPhoto('');
      applyUser(response?.data?.user);
    } catch (removeError) {
      setError(removeError.message || 'Could not remove the photo');
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await userService.updateCurrentUser({
        name: name.trim(),
        email: email.trim(),
        city: city.trim(),
        state: stateName.trim(),
        gender,
        dateOfBirth: dateOfBirth.trim(),
        bio: bio.trim(),
      });
      applyUser(response?.data?.user);
      Alert.alert('Profile updated');
      navigation.goBack();
    } catch (saveError) {
      setError(saveError.message || 'Could not update your profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll padded={false} edges={['top']}>
      <AppHeader title="Edit Profile" showBack onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel="Profile photo" style={styles.photoWrap}>
          {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <View style={styles.photo}><Text style={styles.photoHint}>Add photo</Text></View>}
        </Pressable>
        {photo ? (
          <Pressable onPress={removePhoto} accessibilityRole="button" accessibilityLabel="Remove profile photo">
            <Text style={styles.remove}>Remove photo</Text>
          </Pressable>
        ) : null}
        <Text style={styles.phone}>{user?.phoneMasked || 'Phone verified'}</Text>
        <Text style={styles.readOnly}>Phone number is verified and cannot be changed here.</Text>
        <AppInput label="Full name" value={name} onChangeText={setName} maxLength={60} />
        <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <AppInput label="City" value={city} onChangeText={setCity} maxLength={80} />
        <AppInput label="State" value={stateName} onChangeText={setStateName} maxLength={80} />
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genders}>
          {GENDERS.map((option) => (
            <Pressable
              key={option.value || 'unset'}
              onPress={() => setGender(option.value)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              style={[styles.gender, gender === option.value && styles.genderOn]}
            >
              <Text style={styles.genderText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
        <AppInput label="Date of birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" autoCapitalize="none" />
        <AppTextArea label="Bio" value={bio} onChangeText={setBio} maxLength={250} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title={saving ? 'Saving...' : 'Save Changes'} onPress={save} disabled={saving} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md },
  photoWrap: { alignSelf: 'center' },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoHint: { ...typography.caption, color: colors.textSecondary },
  remove: { ...typography.caption, color: colors.error, textAlign: 'center' },
  phone: { ...typography.body, color: colors.textPrimary, textAlign: 'center' },
  readOnly: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  error: { ...typography.caption, color: colors.error },
  label: { ...typography.caption, color: colors.textSecondary },
  genders: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  gender: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  genderOn: { borderColor: colors.primary, backgroundColor: colors.background },
  genderText: { ...typography.caption, color: colors.textPrimary },
});

export default EditProfileScreen;
