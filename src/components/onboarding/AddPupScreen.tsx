import React, { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookButton } from './ScrapbookButton';
import { ScreenTransition } from './ScreenTransition';
import { BreedPicker } from '../ui/BreedPicker';
import { useOnboardingStore } from '../../stores/onboardingStore';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_SPACING,
  OB_RADII,
  OB_BORDERS,
} from '../../constants/onboardingTheme';

interface AddPupScreenProps {
  onNext: () => void;
}

export function AddPupScreen({ onNext }: AddPupScreenProps) {
  const store = useOnboardingStore();
  const { name, breed, photoUri, loveNote } = store.dogProfile;
  const [imageError, setImageError] = useState(false);

  const canContinue = name.trim().length > 0 && breed.trim().length > 0;

  const handlePickPhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        store.setDogField('photoUri', result.assets[0].uri);
        setImageError(false);
      }
    } catch {
      setImageError(true);
    }
  }, [store]);

  return (
    <OnboardingShell step={9}>
      <ScreenTransition step={9}>
        <View style={styles.content}>
          <Text style={styles.heading}>Tell us about your pup</Text>

          {/* Wood photo frame */}
          <Pressable
            onPress={handlePickPhoto}
            style={styles.frameOuter}
            accessibilityRole="button"
            accessibilityLabel={photoUri ? 'Change photo' : 'Add a photo of your dog'}
            accessibilityHint="Opens your photo library"
          >
            <View style={styles.frameInner}>
              {photoUri && !imageError ? (
                <Image
                  source={{ uri: photoUri }}
                  style={styles.photo}
                  accessibilityLabel={`Photo of ${name || 'your dog'}`}
                  onError={() => setImageError(true)}
                />
              ) : (
                <Text style={styles.framePlaceholder}>tap for photo</Text>
              )}
            </View>
          </Pressable>

          {/* Form fields */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(text) => store.setDogField('name', text)}
              placeholder="Name"
              placeholderTextColor={OB_COLORS.muted}
              autoCapitalize="words"
              autoCorrect={false}
              accessibilityLabel="Dog's name"
              testID="add-pup-name-input"
            />

            <View style={styles.breedWrapper}>
              <BreedPicker
                value={breed}
                onChangeText={(text) => store.setDogField('breed', text)}
                accessibilityLabel="Dog's breed"
              />
            </View>

            <TextInput
              style={styles.input}
              value={loveNote}
              onChangeText={(text) => store.setDogField('loveNote', text)}
              placeholder="What you love most about them"
              placeholderTextColor={OB_COLORS.muted}
              autoCapitalize="sentences"
              multiline={false}
              accessibilityLabel="What you love most about your dog"
              testID="add-pup-love-note-input"
            />
          </View>

          <View style={styles.buttonContainer}>
            <ScrapbookButton
              label="Continue"
              onPress={onNext}
              disabled={!canContinue}
              testID="add-pup-continue-button"
            />
          </View>
        </View>
      </ScreenTransition>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  heading: {
    fontFamily: OB_FONTS.h2,
    fontSize: OB_FONT_SIZES.h2,
    color: OB_COLORS.ink,
    lineHeight: OB_FONT_SIZES.h2 * 1.25,
    textAlign: 'center',
    marginBottom: OB_SPACING.sectionGap,
  },
  frameOuter: {
    width: 140,
    height: 140,
    backgroundColor: OB_COLORS.wood,
    borderWidth: OB_BORDERS.woodFrame,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.woodFrame,
    padding: OB_SPACING.frameBorder,
    alignSelf: 'center',
    marginBottom: OB_SPACING.gap4,
  },
  frameInner: {
    flex: 1,
    backgroundColor: OB_COLORS.woodDk,
    borderRadius: OB_RADII.woodFrame - 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: OB_RADII.woodFrame - 2,
  },
  framePlaceholder: {
    fontFamily: OB_FONTS.handwritten,
    fontSize: 18,
    color: '#f3e3c4',
    textAlign: 'center',
  },
  form: {
    gap: OB_SPACING.gap2,
  },
  input: {
    backgroundColor: OB_COLORS.cream,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.field,
    height: 44,
    paddingHorizontal: 14,
    fontFamily: OB_FONTS.placeholder,
    fontSize: OB_FONT_SIZES.placeholder,
    color: OB_COLORS.ink,
  },
  breedWrapper: {
    zIndex: 10,
  },
  buttonContainer: {
    marginTop: OB_SPACING.sectionGap,
  },
});
