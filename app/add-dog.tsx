import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDogStore } from '../src/stores/dogStore';
import { InputField } from '../src/components/ui/InputField';
import { Button } from '../src/components/ui/Button';
import { StepperDots } from '../src/components/ui/StepperDots';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../src/constants/theme';
import { LIMITS } from '../src/constants/config';

export default function AddDog() {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addDog = useDogStore((s) => s.addDog);
  const router = useRouter();

  const handleSave = async () => {
    setError('');

    if (!name.trim()) {
      setError("Please enter your dog's name.");
      return;
    }
    if (!breed.trim()) {
      setError("Please enter your dog's breed (or 'Mixed').");
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
      await addDog({
        name: name.trim(),
        breed: breed.trim(),
        age_years: ageNum,
        weight_lbs: weightNum,
        vet_phone: vetPhone.trim() || null,
      });
      router.back();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add dog. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable
              style={[styles.backCircle, SHADOWS.subtle]}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Cancel and go back"
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          <StepperDots totalSteps={2} currentStep={1} label="Step 2 of 2" />

          <Text style={styles.subtitle}>Almost there!</Text>
          <Text style={styles.heading}>Tell Us About Your Dog</Text>

          <View style={styles.form}>
            <InputField
              icon="paw"
              placeholder="Dog's name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              accessibilityLabel="Dog's name"
            />

            <InputField
              icon="dog"
              placeholder="Breed (e.g., Golden Retriever)"
              value={breed}
              onChangeText={setBreed}
              autoCapitalize="words"
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
                  accessibilityLabel="Dog's age in years"
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
                  accessibilityLabel="Dog's weight in pounds"
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
            <Text style={styles.hint}>
              We'll use this to show a "Call Your Vet" button in results
            </Text>

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <View style={styles.buttonContainer}>
              <Button
                title="Continue"
                onPress={handleSave}
                loading={isSubmitting}
                disabled={isSubmitting}
                icon="arrow-right"
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
  headerRow: {
    marginBottom: SPACING.md,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  heading: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
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
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: -SPACING.xs,
    marginLeft: SPACING.md,
    marginBottom: SPACING.sm,
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
});
