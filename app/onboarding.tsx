import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import { OB_COLORS } from '../src/constants/onboardingTheme';
import { ScreenTransition } from '../src/components/onboarding/ScreenTransition';
import { haptic } from '../src/lib/haptics';

// Static/marketing screens
import { WelcomeScreen } from '../src/components/onboarding/WelcomeScreen';
import { ValuePropScreen } from '../src/components/onboarding/ValuePropScreen';
import { SocialProofScreen } from '../src/components/onboarding/SocialProofScreen';
import { BiscuitIntroScreen } from '../src/components/onboarding/BiscuitIntroScreen';
import { SocialProof2Screen } from '../src/components/onboarding/SocialProof2Screen';

// Survey screens
import { SurveyAttributionScreen } from '../src/components/onboarding/SurveyAttributionScreen';
import { SurveyWorriesScreen } from '../src/components/onboarding/SurveyWorriesScreen';
import { SurveySeverityScreen } from '../src/components/onboarding/SurveySeverityScreen';
import { SurveyHistoryScreen } from '../src/components/onboarding/SurveyHistoryScreen';
import { SurveyBlindsideScreen } from '../src/components/onboarding/SurveyBlindsideScreen';

// Dog profile screens
import { AddPupScreen } from '../src/components/onboarding/AddPupScreen';
import { BirthdayScreen } from '../src/components/onboarding/BirthdayScreen';
import { HealthBaselineScreen } from '../src/components/onboarding/HealthBaselineScreen';

// Intelligence screens
import { BuildingPlanScreen } from '../src/components/onboarding/BuildingPlanScreen';
import { PersonalizedPlanScreen } from '../src/components/onboarding/PersonalizedPlanScreen';

// Engagement screens
import { PromiseScreen } from '../src/components/onboarding/PromiseScreen';
import { NotificationsScreen } from '../src/components/onboarding/NotificationsScreen';
import { RatingScreen } from '../src/components/onboarding/RatingScreen';
import { PaywallScreen } from '../src/components/onboarding/PaywallScreen';

export default function OnboardingFlow() {
  const router = useRouter();
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const nextStep = useOnboardingStore((s) => s.nextStep);

  const handleNext = useCallback(() => {
    haptic('tick');
    nextStep();
  }, [nextStep]);

  const handleSignIn = useCallback(() => {
    router.replace('/(auth)/sign-in');
  }, [router]);

  const handlePaywallComplete = useCallback(async () => {
    await AsyncStorage.setItem('puplog-onboarding-complete', 'true');
    router.replace('/(auth)/sign-up');
  }, [router]);

  const handlePaywallSkip = useCallback(async () => {
    await AsyncStorage.setItem('puplog-onboarding-complete', 'true');
    router.replace('/(auth)/sign-up');
  }, [router]);

  const handleRestore = useCallback(() => {
    // Restore purchases — route to sign-in for existing users
    router.replace('/(auth)/sign-in');
  }, [router]);

  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onNext={handleNext} onSignIn={handleSignIn} />;
      case 1:
        return <ValuePropScreen onNext={handleNext} />;
      case 2:
        return <SocialProofScreen onNext={handleNext} />;
      case 3:
        return <SurveyAttributionScreen onNext={handleNext} />;
      case 4:
        return <SurveyWorriesScreen onNext={handleNext} />;
      case 5:
        return <SurveySeverityScreen onNext={handleNext} />;
      case 6:
        return <SurveyHistoryScreen onNext={handleNext} />;
      case 7:
        return <SurveyBlindsideScreen onNext={handleNext} />;
      case 8:
        return <BiscuitIntroScreen onNext={handleNext} />;
      case 9:
        return <AddPupScreen onNext={handleNext} />;
      case 10:
        return <BirthdayScreen onNext={handleNext} />;
      case 11:
        return <HealthBaselineScreen onNext={handleNext} />;
      case 12:
        return <BuildingPlanScreen onNext={handleNext} />;
      case 13:
        return <PersonalizedPlanScreen onNext={handleNext} />;
      case 14:
        return <SocialProof2Screen onNext={handleNext} />;
      case 15:
        return <PromiseScreen onNext={handleNext} />;
      case 16:
        return <NotificationsScreen onNext={handleNext} />;
      case 17:
        return <RatingScreen onNext={handleNext} />;
      case 18:
        return (
          <PaywallScreen
            onNext={handlePaywallComplete}
            onSkip={handlePaywallSkip}
            onRestore={handleRestore}
          />
        );
      default:
        return <WelcomeScreen onNext={handleNext} onSignIn={handleSignIn} />;
    }
  };

  return (
    <View style={styles.container}>
      <ScreenTransition step={currentStep}>
        {renderScreen()}
      </ScreenTransition>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OB_COLORS.cream,
  },
});
