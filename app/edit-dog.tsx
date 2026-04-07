import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useDogStore } from '../src/stores/dogStore';
import { InputField } from '../src/components/ui/InputField';
import { BreedPicker } from '../src/components/ui/BreedPicker';
import { Button } from '../src/components/ui/Button';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../src/constants/theme';
import { LIMITS } from '../src/constants/config';
import { DOG_BREEDS } from '../src/constants/dogBreeds';

export default function EditDog() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { dogs, updateDog, updateDogPhoto, deleteDog } = useDogStore();
  const dog = dogs.find((d) => d.id === id);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (dog) {
      setName(dog.name);
      setBreed(dog.breed);
      setAge(String(dog.age_years));
      setWeight(String(dog.weight_lbs));
      setVetPhone(dog.vet_phone ?? '');
    }
  }, [dog]);

  if (!dog) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Dog not found</Text>
          <Pressable style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handlePickPhoto = async () => {
    if (!dog) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    setIsUploadingPhoto(true);
    try {
      await updateDogPhoto(dog.id, result.assets[0].uri);
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message ?? 'Could not upload photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setError('');

    if (!name.trim()) {
      setError("Please enter your dog's name.");
      return;
    }
    if (!breed.trim()) {
      setError("Please enter your dog's breed.");
      return;
    }
    if (!DOG_BREEDS.some((b) => b.toLowerCase() === breed.trim().toLowerCase())) {
      setError('Please select a breed from the list.');
      return;
    }

    const ageNum = parseFloat(age);
    if (isNaN(ageNum) || ageNum < LIMITS.DOG_AGE_MIN || ageNum > LIMITS.DOG_AGE_MAX) {
      setError(`Age must be between ${LIMITS.DOG_AGE_MIN} and ${LIMITS.DOG_AGE_MAX} years.`);
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 300) {
      setError('Please enter a valid weight in pounds.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDog(dog.id, {
        name: name.trim(),
        breed: breed.trim(),
        age_years: ageNum,
        weight_lbs: weightNum,
        vet_phone: vetPhone.trim() || null,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      `Delete ${dog.name}?`,
      'This will permanently remove this dog profile and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDog(dog.id);
              router.back();
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Failed to delete dog.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable
              style={[styles.backCircle, SHADOWS.subtle]}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Cancel and go back"
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Edit Dog</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.form}>
            {/* Dog Photo */}
            <Pressable
              style={styles.photoWrapper}
              onPress={handlePickPhoto}
              disabled={isUploadingPhoto}
              accessibilityRole="button"
              accessibilityLabel="Change dog photo"
            >
              <View style={styles.photoCircle}>
                {dog.photo_url ? (
                  <Image source={{ uri: dog.photo_url }} style={styles.photoImage} />
                ) : (
                  <MaterialCommunityIcons name="paw" size={36} color={COLORS.textDisabled} />
                )}
              </View>
              <View style={styles.photoCameraBadge}>
                {isUploadingPhoto ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MaterialCommunityIcons name="camera" size={14} color="#FFFFFF" />
                )}
              </View>
            </Pressable>

            <InputField
              icon="paw"
              placeholder="Dog's name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              accessibilityLabel="Dog's name"
            />

            <BreedPicker
              value={breed}
              onChangeText={setBreed}
              accessibilityLabel="Dog's breed"
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <InputField
                  icon="calendar-outline"
                  placeholder="Age"
                  value={age}
                  onChangeText={(t) => setAge(t.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  rightText="years"
                  accessibilityLabel="Dog's age"
                />
              </View>
              <View style={styles.halfField}>
                <InputField
                  icon="scale-bathroom"
                  placeholder="Weight"
                  value={weight}
                  onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  rightText="lbs"
                  accessibilityLabel="Dog's weight"
                />
              </View>
            </View>

            <InputField
              icon="phone-outline"
              placeholder="Vet phone (optional)"
              value={vetPhone}
              onChangeText={setVetPhone}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              accessibilityLabel="Veterinarian phone number"
            />

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <View style={styles.buttonContainer}>
              <Button
                title="Save Changes"
                onPress={handleSave}
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </View>

            <View style={styles.deleteContainer}>
              <Button
                title={`Delete ${dog.name}`}
                onPress={handleDelete}
                variant="danger-outline"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  backLink: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  backLinkText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  photoWrapper: {
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfField: {
    flex: 1,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
    marginLeft: SPACING.md,
  },
  buttonContainer: {
    marginTop: SPACING.lg,
  },
  deleteContainer: {
    marginTop: SPACING.md,
  },
});
