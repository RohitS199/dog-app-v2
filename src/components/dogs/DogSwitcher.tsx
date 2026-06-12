import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — @expo/vector-icons type resolution is broken repo-wide (24 pre-existing tsc errors); suppressed so new files stay out of the error baseline
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { OB_BORDERS, OB_COLORS, OB_FONTS } from '../../constants/onboardingTheme';
import { MIN_TOUCH_TARGET } from '../../constants/theme';
import type { Dog } from '../../types/api';

const AVATAR_SIZE = 56;
const PILL_WIDTH = 64;

export interface DogSwitcherProps {
  dogs: Dog[];
  selectedDogId: string | null;
  onSelectDog: (id: string) => void;
  onAddDog: () => void;
}

export function DogSwitcher({
  dogs,
  selectedDogId,
  onSelectDog,
  onAddDog,
}: DogSwitcherProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {dogs.map((dog) => {
        const selected = dog.id === selectedDogId;
        return (
          <Pressable
            key={dog.id}
            onPress={() => onSelectDog(dog.id)}
            accessibilityRole="button"
            accessibilityLabel={'Select ' + dog.name}
            accessibilityState={{ selected }}
            style={styles.pill}
          >
            <View
              style={[
                styles.avatar,
                selected ? styles.avatarSelected : styles.avatarIdle,
              ]}
            >
              {dog.photo_url ? (
                <Image
                  source={{ uri: dog.photo_url }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarInitial}>
                  {dog.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <Text
              style={[styles.label, selected ? styles.labelSelected : styles.labelIdle]}
              numberOfLines={1}
            >
              {dog.name}
            </Text>
          </Pressable>
        );
      })}

      {/* Add pill */}
      <Pressable
        onPress={onAddDog}
        accessibilityRole="button"
        accessibilityLabel="Add a dog"
        style={styles.pill}
      >
        <View style={[styles.avatar, styles.avatarAdd]}>
          <MaterialCommunityIcons
            name="plus"
            size={26}
            color={OB_COLORS.ink}
          />
        </View>
        <Text style={[styles.label, styles.labelIdle]} numberOfLines={1}>
          Add
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingHorizontal: 0, // the screen's 24px gutter provides the inset
    paddingVertical: 8,
  },
  pill: {
    width: PILL_WIDTH,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarIdle: {
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    backgroundColor: OB_COLORS.cardWhite,
  },
  avatarSelected: {
    borderWidth: 3,
    borderColor: OB_COLORS.cta,
    backgroundColor: OB_COLORS.cardWhite,
  },
  avatarAdd: {
    backgroundColor: OB_COLORS.washNeutral,
    borderWidth: OB_BORDERS.standard,
    borderStyle: 'dashed',
    borderColor: OB_COLORS.sketch,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarInitial: {
    fontFamily: OB_FONTS.h1,
    fontSize: 24,
    color: OB_COLORS.woodDk,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
    width: PILL_WIDTH,
  },
  labelIdle: {
    fontFamily: OB_FONTS.dataLabel,
    color: OB_COLORS.ink2,
  },
  labelSelected: {
    fontFamily: OB_FONTS.btnLabel,
    color: OB_COLORS.ink,
  },
});
