import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import type { OnboardingGoal, OnboardingAttribution } from '../src/stores/onboardingStore';
import { useAuthStore } from '../src/stores/authStore';
import { OnboardingProgress } from '../src/components/ui/OnboardingProgress';
import { BreedHealthCard } from '../src/components/ui/BreedHealthCard';
import { PatternPromiseCard } from '../src/components/ui/PatternPromiseCard';
import { SocialAuthButton } from '../src/components/ui/SocialAuthButton';
import { CheckInCard } from '../src/components/ui/CheckInCard';
import { ProgressDots } from '../src/components/ui/ProgressDots';
import { DaySummaryCard } from '../src/components/ui/DaySummaryCard';
import { Button } from '../src/components/ui/Button';
import { InputField } from '../src/components/ui/InputField';
import { BreedPicker } from '../src/components/ui/BreedPicker';
import { getBreedHealthConcerns } from '../src/constants/breedHealthData';
import { CHECK_IN_QUESTIONS } from '../src/constants/checkInQuestions';
import { LIMITS, LEGAL } from '../src/constants/config';
import { supabase } from '../src/lib/supabase';
import {
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
  MIN_TOUCH_TARGET,
} from '../src/constants/theme';
import type { MetricField } from '../src/types/checkIn';

// COPPA age calculation (reused from sign-up.tsx)
function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// Goal options
const GOALS: { value: OnboardingGoal; label: string; icon: string; desc: string }[] = [
  { value: 'peace_of_mind', label: 'Peace of Mind', icon: 'shield-check-outline', desc: 'Know my dog is doing well day-to-day' },
  { value: 'catch_early', label: 'Catch Problems Early', icon: 'magnify', desc: 'Spot subtle changes before they become serious' },
  { value: 'track_daily', label: 'Track Daily Health', icon: 'chart-line', desc: 'Build a health record over time' },
  { value: 'vet_prep', label: 'Be Vet-Ready', icon: 'clipboard-text-outline', desc: 'Have data to share with my veterinarian' },
];

// Attribution options
const ATTRIBUTIONS: { value: OnboardingAttribution; label: string; icon: string }[] = [
  { value: 'social', label: 'Social media', icon: 'cellphone' },
  { value: 'friend', label: 'Friend or family', icon: 'account-group' },
  { value: 'vet', label: 'My veterinarian', icon: 'stethoscope' },
  { value: 'search', label: 'Web search', icon: 'magnify' },
  { value: 'app_store', label: 'App Store', icon: 'store' },
];

// Known conditions options
const CONDITION_OPTIONS = [
  'Allergies', 'Arthritis', 'Diabetes', 'Epilepsy',
  'Heart Disease', 'Kidney Disease', 'Thyroid Issues', 'Cancer', 'None',
];

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Safe hook: uses Superwall in dev builds, no-op fallback in Expo Go
const superwallModule = isExpoGo ? null : require('expo-superwall');

function useSuperwallPlacement(onAdvance: () => void) {
  if (superwallModule) {
    const { usePlacement } = superwallModule;
    return usePlacement({
      onPresent: () => {},
      onDismiss: () => onAdvance(),
      onSkip: () => onAdvance(),
      onError: () => onAdvance(),
    });
  }
  // Expo Go fallback
  return {
    registerPlacement: async ({ feature }: { feature?: () => void }) => {
      feature?.();
    },
  };
}

// Loading messages for step 14
const LOADING_MESSAGES = [
  'Analyzing responses...',
  'Checking breed-specific patterns...',
  'Building health baseline...',
  'Generating first snapshot...',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const {
    currentStep,
    goal,
    attribution,
    dogProfile,
    checkInAnswers,
    daySummary,
    isSubmitting,
    isSyncing,
    error,
    setGoal,
    setAttribution,
    setDogField,
    setCheckInAnswer,
    nextStep,
    prevStep,
    goToStep,
    generateSnapshot,
    syncOnboardingData,
    clearOnboarding,
  } = useOnboardingStore();

  const { signUp, signInWithGoogle, signInWithApple } = useAuthStore();

  // Step 17: Superwall paywall placement
  // In Expo Go (no native module), falls back to a no-op that calls the feature gate directly
  const superwallPlacement = useSuperwallPlacement(nextStep);

  // Step 14 loading state
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  // Step 18 account creation state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [accountError, setAccountError] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Progress: 15% base + 85% proportional to currentStep
  const progress = currentStep === 0 ? 0 : 0.15 + (currentStep / MAX_STEP) * 0.85;

  // Scroll to top on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentStep]);

  // Step 14: Loading animation + auto-advance
  useEffect(() => {
    if (currentStep !== 14) return;

    generateSnapshot();

    const msgInterval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);

    const advanceTimeout = setTimeout(() => {
      nextStep();
    }, 3500);

    return () => {
      clearInterval(msgInterval);
      clearTimeout(advanceTimeout);
    };
  }, [currentStep]);

  // Get inline alert for check-in steps (Golden Rule)
  const getCheckInAlert = (): { message: string } | null => {
    const checkInStep = currentStep - 7; // 0-6 maps to questions 0-6
    if (checkInStep === 3 && checkInAnswers.stool_quality === 'blood') {
      return { message: 'Blood in stool should be evaluated by a vet. Please note this for your next vet visit.' };
    }
    if (checkInStep === 4 && checkInAnswers.vomiting === 'dry_heaving') {
      return { message: 'Dry heaving can be a sign of bloat (GDV), which is a life-threatening emergency. If your dog is actively dry heaving, contact your vet immediately.' };
    }
    return null;
  };

  const handleAutoAdvance = (setter: () => void) => {
    setter();
    setTimeout(() => nextStep(), 400);
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDogField('photoUri', result.assets[0].uri);
    }
  };

  const validateDogProfile = (): boolean => {
    if (!dogProfile.name.trim()) {
      useOnboardingStore.setState({ error: "Please enter your dog's name." });
      return false;
    }
    if (!dogProfile.breed.trim()) {
      useOnboardingStore.setState({ error: "Please enter your dog's breed." });
      return false;
    }
    const { DOG_BREEDS } = require('../src/constants/dogBreeds');
    const breedLower = dogProfile.breed.trim().toLowerCase();
    if (!DOG_BREEDS.some((b: string) => b.toLowerCase() === breedLower)) {
      useOnboardingStore.setState({ error: 'Please select a breed from the list.' });
      return false;
    }
    const ageNum = parseFloat(dogProfile.ageYears);
    if (isNaN(ageNum) || ageNum < LIMITS.DOG_AGE_MIN || ageNum > LIMITS.DOG_AGE_MAX) {
      useOnboardingStore.setState({ error: `Age must be between ${LIMITS.DOG_AGE_MIN} and ${LIMITS.DOG_AGE_MAX}.` });
      return false;
    }
    const weightNum = parseFloat(dogProfile.weightLbs);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 300) {
      useOnboardingStore.setState({ error: 'Please enter a valid weight.' });
      return false;
    }
    useOnboardingStore.setState({ error: null });
    return true;
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    setAccountError('');
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithApple();
      }
      // If terms check needed, insert inline terms acceptance
      if (termsChecked) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_acknowledgments').insert({
            user_id: user.id,
            terms_version: LEGAL.TERMS_VERSION,
          });
          await useAuthStore.getState().checkTermsAcceptance();
        }
      }
      // Sync will be triggered by _layout.tsx effect
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleEmailSignUp = async () => {
    setAccountError('');

    if (!email.trim()) {
      setAccountError('Please enter your email address.');
      return;
    }
    if (password.length < 8) {
      setAccountError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setAccountError('Passwords do not match.');
      return;
    }
    if (!termsChecked) {
      setAccountError('Please agree to the Terms of Service.');
      return;
    }

    // COPPA validation
    const month = parseInt(dobMonth, 10);
    const day = parseInt(dobDay, 10);
    const year = parseInt(dobYear, 10);
    if (!month || !day || !year || month < 1 || month > 12 || day < 1 || day > 31) {
      setAccountError('Please enter a valid date of birth.');
      return;
    }
    const dob = new Date(year, month - 1, day);
    if (isNaN(dob.getTime())) {
      setAccountError('Please enter a valid date of birth.');
      return;
    }
    if (calculateAge(dob) < LIMITS.COPPA_MIN_AGE) {
      setAccountError(`You must be at least ${LIMITS.COPPA_MIN_AGE} years old to use this app.`);
      return;
    }

    setIsCreatingAccount(true);
    try {
      await signUp(email.trim().toLowerCase(), password);
      Alert.alert(
        'Check Your Email',
        'We sent you a confirmation link. Please verify your email, then sign in to complete setup.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
      );
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Sign up failed.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const toggleCondition = (condition: string) => {
    const current = dogProfile.knownConditions;
    if (condition === 'None') {
      setDogField('knownConditions', ['None']);
      return;
    }
    const withoutNone = current.filter((c) => c !== 'None');
    if (withoutNone.includes(condition)) {
      setDogField('knownConditions', withoutNone.filter((c) => c !== condition));
    } else {
      setDogField('knownConditions', [...withoutNone, condition]);
    }
  };

  // ── RENDER STEP CONTENT ──

  const renderStep = () => {
    switch (currentStep) {
      // ── STEP 0: WELCOME ──
      case 0:
        return (
          <View style={styles.centeredContent}>
            <View style={styles.welcomeLogoContainer}>
              <Image
                source={require('../assets/logo-transparent.png')}
                style={styles.welcomeLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeTitle}>PupLog</Text>
            <Text style={styles.welcomeTagline}>
              Every dog deserves a health advocate
            </Text>
            <View style={styles.welcomeActions}>
              <Button
                title="Get Started"
                onPress={nextStep}
                icon="arrow-right"
              />
              <Pressable
                style={styles.signInLink}
                onPress={async () => {
                  await AsyncStorage.setItem('puplog-onboarding-complete', 'true');
                  router.replace('/(auth)/sign-in');
                }}
                accessibilityRole="link"
              >
                <Text style={styles.signInLinkText}>
                  Already have an account? <Text style={styles.signInLinkBold}>Sign In</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        );

      // ── STEP 1: GOAL SELECTION ──
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>What matters most to you?</Text>
            <View style={styles.optionsContainer}>
              {GOALS.map((g) => {
                const isSelected = goal === g.value;
                return (
                  <Pressable
                    key={g.value}
                    style={[styles.goalCard, isSelected && styles.goalCardSelected]}
                    onPress={() => handleAutoAdvance(() => setGoal(g.value))}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={[styles.goalIconCircle, isSelected && styles.goalIconCircleSelected]}>
                      <MaterialCommunityIcons
                        name={g.icon as any}
                        size={24}
                        color={isSelected ? '#FFFFFF' : COLORS.accent}
                      />
                    </View>
                    <View style={styles.goalTextContainer}>
                      <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>{g.label}</Text>
                      <Text style={styles.goalDesc}>{g.desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );

      // ── STEP 2: ATTRIBUTION ──
      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>How did you hear about PupLog?</Text>
            <View style={styles.optionsContainer}>
              {ATTRIBUTIONS.map((a) => {
                const isSelected = attribution === a.value;
                return (
                  <Pressable
                    key={a.value}
                    style={[styles.attributionOption, isSelected && styles.attributionOptionSelected]}
                    onPress={() => handleAutoAdvance(() => setAttribution(a.value))}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <MaterialCommunityIcons
                      name={a.icon as any}
                      size={20}
                      color={isSelected ? COLORS.accent : COLORS.textSecondary}
                    />
                    <Text style={[styles.attributionText, isSelected && styles.attributionTextSelected]}>
                      {a.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              style={styles.skipLink}
              onPress={nextStep}
              accessibilityRole="link"
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>
        );

      // ── STEP 3: EDUCATION ──
      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Daily tracking catches what you might miss</Text>
            <View style={styles.educationCards}>
              <View style={styles.eduCard}>
                <View style={styles.eduIconCircle}>
                  <MaterialCommunityIcons name="eye-outline" size={20} color={COLORS.accent} />
                </View>
                <View style={styles.eduTextContainer}>
                  <Text style={styles.eduCardTitle}>Subtle Changes Matter</Text>
                  <Text style={styles.eduCardDesc}>
                    Subtle appetite changes over days can signal developing issues that are easy to miss day-to-day.
                  </Text>
                </View>
              </View>
              <View style={styles.eduCard}>
                <View style={styles.eduIconCircle}>
                  <MaterialCommunityIcons name="dog" size={20} color={COLORS.accent} />
                </View>
                <View style={styles.eduTextContainer}>
                  <Text style={styles.eduCardTitle}>Dogs Hide Pain</Text>
                  <Text style={styles.eduCardDesc}>
                    Dogs instinctively mask discomfort. Structured daily questions help reveal what they cannot tell you.
                  </Text>
                </View>
              </View>
              <View style={styles.eduCard}>
                <View style={styles.eduIconCircle}>
                  <MaterialCommunityIcons name="stethoscope" size={20} color={COLORS.accent} />
                </View>
                <View style={styles.eduTextContainer}>
                  <Text style={styles.eduCardTitle}>Vets Need Data</Text>
                  <Text style={styles.eduCardDesc}>
                    Vets need day-over-day pattern data to make accurate assessments. PupLog gives them exactly that.
                  </Text>
                </View>
              </View>
            </View>
            <Button
              title="Let's set up your dog"
              onPress={nextStep}
              icon="arrow-right"
            />
          </View>
        );

      // ── STEP 4: DOG PROFILE ──
      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>Tell us about your dog</Text>

            {/* Photo picker */}
            <Pressable
              style={styles.photoPicker}
              onPress={handlePickPhoto}
              accessibilityRole="button"
              accessibilityLabel="Add dog photo"
            >
              {dogProfile.photoUri ? (
                <Image source={{ uri: dogProfile.photoUri }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.textDisabled} />
                  <Text style={styles.photoText}>Add Photo</Text>
                </View>
              )}
            </Pressable>

            <InputField
              icon="paw"
              placeholder="Dog's name"
              value={dogProfile.name}
              onChangeText={(t) => setDogField('name', t)}
              autoCapitalize="words"
              accessibilityLabel="Dog's name"
            />

            <BreedPicker
              value={dogProfile.breed}
              onChangeText={(t) => setDogField('breed', t)}
              accessibilityLabel="Dog's breed"
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <InputField
                  icon="calendar-outline"
                  placeholder="Age"
                  value={dogProfile.ageYears}
                  onChangeText={(t) => setDogField('ageYears', t.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  rightText="years"
                  accessibilityLabel="Dog's age in years"
                />
              </View>
              <View style={styles.halfField}>
                <InputField
                  icon="scale-bathroom"
                  placeholder="Weight"
                  value={dogProfile.weightLbs}
                  onChangeText={(t) => setDogField('weightLbs', t.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  rightText="lbs"
                  accessibilityLabel="Dog's weight in pounds"
                />
              </View>
            </View>

            {error && (
              <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
            )}

            <Button
              title="Continue"
              onPress={() => {
                if (validateDogProfile()) nextStep();
              }}
              icon="arrow-right"
            />
          </View>
        );

      // ── STEP 5: EXTENDED PROFILE ──
      case 5:
        return (
          <View>
            <Text style={styles.stepTitle}>A little more about {dogProfile.name || 'your dog'}</Text>

            {/* Spayed/Neutered */}
            <Text style={styles.fieldLabel}>Spayed or Neutered?</Text>
            <View style={styles.toggleRow}>
              {(['Yes', 'No', 'Not sure'] as const).map((option) => {
                const value = option === 'Yes' ? true : option === 'No' ? false : null;
                const isSelected = dogProfile.spayedNeutered === value;
                return (
                  <Pressable
                    key={option}
                    style={[styles.toggleChip, isSelected && styles.toggleChipSelected]}
                    onPress={() => setDogField('spayedNeutered', value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.toggleChipText, isSelected && styles.toggleChipTextSelected]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Known conditions */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.lg }]}>
              Any known health conditions?
            </Text>
            <View style={styles.chipGrid}>
              {CONDITION_OPTIONS.map((cond) => {
                const isSelected = dogProfile.knownConditions.includes(cond);
                return (
                  <Pressable
                    key={cond}
                    style={[styles.conditionChip, isSelected && styles.conditionChipSelected]}
                    onPress={() => toggleCondition(cond)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Text style={[styles.conditionChipText, isSelected && styles.conditionChipTextSelected]}>
                      {cond}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Vet phone */}
            <InputField
              icon="phone-outline"
              placeholder="Vet phone (optional)"
              value={dogProfile.vetPhone}
              onChangeText={(t) => setDogField('vetPhone', t)}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              accessibilityLabel="Veterinarian phone number"
            />

            <Button
              title="Continue"
              onPress={nextStep}
              icon="arrow-right"
            />
            <Pressable style={styles.skipLink} onPress={nextStep} accessibilityRole="link">
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
          </View>
        );

      // ── STEP 6: BREED HEALTH CONCERNS ──
      case 6: {
        const concerns = getBreedHealthConcerns(dogProfile.breed);
        const displayName = dogProfile.name || 'Your Dog';
        return (
          <View>
            <Text style={styles.stepTitle}>{displayName}'s Breed Profile</Text>
            {concerns.map((concern, i) => (
              <BreedHealthCard key={i} concern={concern} />
            ))}
            <Text style={styles.breedNote}>
              Daily check-ins help catch these early.
            </Text>
            <Button
              title={`Start ${displayName}'s First Check-In`}
              onPress={nextStep}
              icon="arrow-right"
            />
          </View>
        );
      }

      // ── STEPS 7-13: CHECK-IN QUESTIONS ──
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13: {
        const questionIndex = currentStep - 7;
        const question = CHECK_IN_QUESTIONS[questionIndex];
        const fieldId = question.id as MetricField;
        const selectedValue = (checkInAnswers[fieldId] as string) ?? null;

        return (
          <View>
            <ProgressDots totalSteps={7} currentStep={questionIndex} />
            <View style={styles.checkInContent}>
              <CheckInCard
                question={question}
                selectedValue={selectedValue}
                onSelect={(value) =>
                  handleAutoAdvance(() => setCheckInAnswer(fieldId, value))
                }
                showAlert={getCheckInAlert()}
              />
            </View>
          </View>
        );
      }

      // ── STEP 14: LOADING (LABOR ILLUSION) ──
      case 14: {
        const displayName = dogProfile.name || 'your dog';
        return (
          <View style={styles.centeredContent}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingTitle}>
              Building {displayName}'s health profile...
            </Text>
            <Text style={styles.loadingMessage}>
              {LOADING_MESSAGES[loadingMsgIndex]}
            </Text>
          </View>
        );
      }

      // ── STEP 15: HEALTH SNAPSHOT ──
      case 15:
        return (
          <View>
            <Text style={styles.stepTitle}>
              {dogProfile.name || 'Your Dog'}'s First Health Snapshot
            </Text>
            <Text style={styles.snapshotNote}>
              This snapshot is based on what you just told us about {dogProfile.name || 'your dog'}.
            </Text>
            {daySummary && (
              <DaySummaryCard
                summary={daySummary}
                streak={1}
                alertsResult={null}
                onDone={nextStep}
              />
            )}
            {!daySummary && (
              <Button title="Continue" onPress={nextStep} icon="arrow-right" />
            )}
          </View>
        );

      // ── STEP 16: AI PROMISE ──
      case 16:
        return (
          <View>
            <Text style={styles.stepTitle}>Unlock AI-Powered Health Intelligence</Text>
            <PatternPromiseCard dogName={dogProfile.name || 'Your Dog'} />
            <View style={styles.promiseCta}>
              <Button title="Continue" onPress={nextStep} icon="arrow-right" />
            </View>
          </View>
        );

      // ── STEP 17: PAYWALL (SUPERWALL) ──
      case 17: {
        // Trigger Superwall paywall immediately when this step renders
        const triggerPaywall = async () => {
          await superwallPlacement.registerPlacement({
            placement: 'onboarding_paywall',
            feature: () => {
              // User has access (subscribed or no paywall configured) — advance
              nextStep();
            },
          });
        };

        // Auto-trigger on render via useEffect in the parent,
        // but also provide a manual button as fallback
        return (
          <View style={{ alignItems: 'center', paddingTop: SPACING.xxl }}>
            <MaterialCommunityIcons name="crown-outline" size={64} color={COLORS.accent} />
            <Text style={[styles.stepTitle, { marginTop: SPACING.lg }]}>
              Unlock PupLog Premium
            </Text>
            <Text style={[styles.stepSubtitle, { textAlign: 'center', marginBottom: SPACING.xl }]}>
              Get AI-powered health insights, unlimited check-ins, and pattern detection.
            </Text>
            <Button
              title="View Plans"
              onPress={triggerPaywall}
              icon="arrow-right"
            />
            <Pressable
              style={styles.skipLink}
              accessibilityRole="link"
              onPress={nextStep}
            >
              <Text style={styles.skipText}>Maybe later</Text>
            </Pressable>
          </View>
        );
      }

      // ── STEP 18: CREATE ACCOUNT ──
      case 18:
        return (
          <View>
            <Text style={styles.stepTitle}>
              Save {dogProfile.name || 'Your Dog'}'s Profile
            </Text>

            {/* Social auth buttons */}
            <SocialAuthButton
              provider="apple"
              onPress={() => handleSocialAuth('apple')}
              loading={socialLoading === 'apple'}
            />
            <SocialAuthButton
              provider="google"
              onPress={() => handleSocialAuth('google')}
              loading={socialLoading === 'google'}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email form */}
            <InputField
              icon="email-outline"
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel="Email address"
            />

            <InputField
              icon="lock-outline"
              placeholder="Password (8+ characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              eyeToggle
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel="Password"
            />

            <InputField
              icon="lock-outline"
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              eyeToggle
              textContentType="newPassword"
              accessibilityLabel="Confirm password"
            />

            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <Text style={styles.hint}>
              You must be at least {LIMITS.COPPA_MIN_AGE} years old
            </Text>
            <View style={styles.dobRow}>
              <View style={styles.dobField}>
                <TextInput
                  style={styles.dobInput}
                  value={dobMonth}
                  onChangeText={(t) => setDobMonth(t.replace(/\D/g, '').slice(0, 2))}
                  placeholder="MM"
                  placeholderTextColor={COLORS.textDisabled}
                  keyboardType="number-pad"
                  maxLength={2}
                  accessibilityLabel="Birth month"
                />
              </View>
              <Text style={styles.dobSeparator}>/</Text>
              <View style={styles.dobField}>
                <TextInput
                  style={styles.dobInput}
                  value={dobDay}
                  onChangeText={(t) => setDobDay(t.replace(/\D/g, '').slice(0, 2))}
                  placeholder="DD"
                  placeholderTextColor={COLORS.textDisabled}
                  keyboardType="number-pad"
                  maxLength={2}
                  accessibilityLabel="Birth day"
                />
              </View>
              <Text style={styles.dobSeparator}>/</Text>
              <View style={[styles.dobField, styles.dobYearField]}>
                <TextInput
                  style={styles.dobInput}
                  value={dobYear}
                  onChangeText={(t) => setDobYear(t.replace(/\D/g, '').slice(0, 4))}
                  placeholder="YYYY"
                  placeholderTextColor={COLORS.textDisabled}
                  keyboardType="number-pad"
                  maxLength={4}
                  accessibilityLabel="Birth year"
                />
              </View>
            </View>

            {/* Inline terms checkbox */}
            <Pressable
              style={styles.termsCheckboxRow}
              onPress={() => setTermsChecked((c) => !c)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: termsChecked }}
            >
              <View style={[styles.checkbox, termsChecked && styles.checkboxChecked]}>
                {termsChecked && (
                  <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </Pressable>

            {accountError ? (
              <Text style={styles.errorText} accessibilityRole="alert">{accountError}</Text>
            ) : null}

            <Button
              title="Create Account"
              onPress={handleEmailSignUp}
              loading={isCreatingAccount}
              disabled={isCreatingAccount || !termsChecked}
              icon="arrow-right"
            />
          </View>
        );

      default:
        return null;
    }
  };

  const showBackButton = currentStep > 0 && currentStep !== 14 && currentStep !== 15;
  const showProgress = currentStep > 0;

  return (
    <SafeAreaView style={styles.safe}>
      {showProgress && <OnboardingProgress progress={progress} />}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Back button */}
          {showBackButton && (
            <Pressable
              style={[styles.backCircle, SHADOWS.subtle]}
              onPress={prevStep}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
            </Pressable>
          )}

          {/* Step content */}
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sync loading overlay */}
      {isSyncing && (
        <View style={styles.syncOverlay}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.syncText}>Saving {dogProfile.name}'s profile...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const MAX_STEP = 18;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },

  // Back button
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },

  // Common step styling
  stepTitle: {
    fontFamily: FONTS.heading,
    fontSize: 26,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  // Step 0: Welcome
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeLogoContainer: {
    marginBottom: SPACING.lg,
  },
  welcomeLogo: {
    width: 120,
    height: 120,
  },
  welcomeTitle: {
    fontFamily: FONTS.heading,
    fontSize: 34,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  welcomeTagline: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  welcomeActions: {
    width: '100%',
  },
  signInLink: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  signInLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  signInLinkBold: {
    color: COLORS.accent,
    fontWeight: '700',
  },

  // Step 1: Goals
  optionsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    minHeight: MIN_TOUCH_TARGET,
  },
  goalCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },
  goalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  goalIconCircleSelected: {
    backgroundColor: COLORS.accent,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  goalLabelSelected: {
    color: COLORS.primary,
  },
  goalDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Step 2: Attribution
  attributionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    minHeight: MIN_TOUCH_TARGET,
    gap: SPACING.sm,
  },
  attributionOptionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },
  attributionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  attributionTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  skipLink: {
    alignItems: 'center',
    marginTop: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  skipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Step 3: Education
  educationCards: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  eduCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  eduIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  eduTextContainer: {
    flex: 1,
  },
  eduCardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  eduCardDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Step 4: Dog profile
  photoPicker: {
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    marginTop: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfField: {
    flex: 1,
  },

  // Step 5: Extended profile
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  toggleChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  toggleChipSelected: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  toggleChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  toggleChipTextSelected: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  conditionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 36,
    justifyContent: 'center',
  },
  conditionChipSelected: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  conditionChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  conditionChipTextSelected: {
    color: COLORS.accent,
    fontWeight: '600',
  },

  // Step 6: Breed health
  breedNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: SPACING.md,
  },

  // Steps 7-13: Check-in
  checkInContent: {
    marginTop: SPACING.md,
  },

  // Step 14: Loading
  loadingTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  loadingMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  // Step 15: Snapshot
  snapshotNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },

  // Step 16: AI Promise
  promiseCta: {
    marginTop: SPACING.lg,
  },

  // Step 17: Paywall
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  planCardRecommended: {
    borderColor: COLORS.accent,
    borderWidth: 2,
  },
  planBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  planBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  planName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  planPrice: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  planDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  paywallFine: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Step 18: Account creation
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dobField: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: MIN_TOUCH_TARGET,
  },
  dobYearField: {
    flex: 1.5,
  },
  dobInput: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
  },
  dobSeparator: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.sm,
  },
  termsCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  termsText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  termsLink: {
    color: COLORS.accent,
    fontWeight: '600',
  },

  // Common
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },

  // Sync overlay
  syncOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 250, 250, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
});
