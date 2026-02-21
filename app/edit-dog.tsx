import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDogStore } from '../src/stores/dogStore';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../src/constants/theme';
import { LIMITS } from '../src/constants/config';

export default function EditDog() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { dogs, updateDog, deleteDog } = useDogStore();
  const dog = dogs.find((d) => d.id === id);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <View style={styles.header}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Cancel and go back"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.title}>Edit Dog</Text>
            <View style={styles.cancelButton} />
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Buddy"
              placeholderTextColor={COLORS.textDisabled}
              autoCapitalize="words"
              accessibilityLabel="Dog's name"
            />

            <Text style={styles.label}>Breed *</Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholder="e.g., Golden Retriever or Mixed"
              placeholderTextColor={COLORS.textDisabled}
              autoCapitalize="words"
              accessibilityLabel="Dog's breed"
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Age (years) *</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={(t) => setAge(t.replace(/[^0-9.]/g, ''))}
                  placeholder="e.g., 3.5"
                  placeholderTextColor={COLORS.textDisabled}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Dog's age in years"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Weight (lbs) *</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ''))}
                  placeholder="e.g., 65"
                  placeholderTextColor={COLORS.textDisabled}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Dog's weight in pounds"
                />
              </View>
            </View>

            <Text style={styles.label}>Vet Phone (optional)</Text>
            <TextInput
              style={styles.input}
              value={vetPhone}
              onChangeText={setVetPhone}
              placeholder="e.g., 555-123-4567"
              placeholderTextColor={COLORS.textDisabled}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              accessibilityLabel="Veterinarian phone number"
            />

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.buttonPressed,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSubmitting}
              accessibilityRole="button"
            >
              <Text style={styles.saveText}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleDelete}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${dog.name}`}
            >
              <Text style={styles.deleteText}>Delete {dog.name}</Text>
            </Pressable>
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
    padding: SPACING.md,
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
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  cancelButton: {
    width: 60,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  cancelText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    minHeight: MIN_TOUCH_TARGET,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfField: {
    flex: 1,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  deleteButton: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  deleteText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
