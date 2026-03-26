import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import {
  COLORS,
  FONT_SIZES,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  MIN_TOUCH_TARGET,
} from '../../constants/theme';
import type { Dog } from '../../types/api';

interface FlippableDogCardProps {
  dog: Dog;
  onEditPress: () => void;
}

function formatLastCheckIn(date: string | null): string {
  if (!date) return 'Never';
  const d = new Date(date + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - d.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export function FlippableDogCard({ dog, onEditPress }: FlippableDogCardProps) {
  const flipProgress = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  // Reset to front face when dog changes
  useEffect(() => {
    flipProgress.value = 0;
  }, [dog.id]);

  const handleFlip = () => {
    const target = flipProgress.value === 0 ? 1 : 0;
    const duration = reduceMotion ? 0 : 500;
    flipProgress.value = withTiming(target, {
      duration,
      easing: Easing.inOut(Easing.cubic),
    });
  };

  const isShowingFront = flipProgress.value === 0;

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, -180]);
    const scale = interpolate(flipProgress.value, [0, 0.5, 1], [1, 0.95, 1]);
    const opacity = interpolate(
      flipProgress.value,
      [0, 0.5, 0.5, 1],
      [1, 1, 0, 0],
    );
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      opacity,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [-180, -360]);
    const scale = interpolate(flipProgress.value, [0, 0.5, 1], [1, 0.95, 1]);
    const opacity = interpolate(
      flipProgress.value,
      [0, 0, 0.5, 1],
      [0, 0, 1, 1],
    );
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <View style={styles.shadowWrapper}>
      <Pressable
        onPress={handleFlip}
        accessibilityRole="button"
        accessibilityLabel={
          isShowingFront
            ? `${dog.name} photo, tap to see details`
            : `${dog.name} details, tap to see photo`
        }
      >
        {/* Front Face */}
        <Animated.View style={[styles.face, frontAnimatedStyle]}>
          <View style={styles.card}>
            {dog.photo_url ? (
              <Image source={{ uri: dog.photo_url }} style={styles.photo} />
            ) : (
              <View style={styles.fallback}>
                <MaterialCommunityIcons name="paw" size={48} color={COLORS.textDisabled} />
              </View>
            )}
            <View style={styles.nameOverlay}>
              <Text style={styles.nameText}>{dog.name}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Back Face */}
        <Animated.View style={[styles.face, styles.backFace, backAnimatedStyle]}>
          <View style={styles.backCard}>
            {/* Header */}
            <Text style={styles.backName}>{dog.name}</Text>
            <Text style={styles.backBreed}>{dog.breed}</Text>

            {/* 2x2 Stat Grid */}
            <View style={styles.statGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Age</Text>
                <Text style={styles.statValue}>
                  {dog.age_years === 1 ? '1 year' : `${dog.age_years} years`}
                </Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Weight</Text>
                <Text style={styles.statValue}>{dog.weight_lbs} lbs</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Streak</Text>
                <Text style={[styles.statValue, styles.streakValue]}>
                  {dog.checkin_streak}
                </Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Last Check-in</Text>
                <Text style={styles.statValue}>
                  {formatLastCheckIn(dog.last_checkin_date)}
                </Text>
              </View>
            </View>

            {/* Vet Phone */}
            <View style={styles.vetRow}>
              <MaterialCommunityIcons
                name="phone"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.vetText}>
                {dog.vet_phone || 'No vet on file'}
              </Text>
            </View>

            {/* Edit Link */}
            <Pressable
              onPress={() => {
                onEditPress();
              }}
              style={styles.editLink}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${dog.name}'s profile`}
            >
              <Text style={styles.editText}>Tap to edit</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.elevated,
  },
  face: {
    backfaceVisibility: 'hidden',
  },
  backFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
  },
  fallback: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  backCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    aspectRatio: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  backName: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  backBreed: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCell: {
    width: '47%',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    marginBottom: 2,
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  streakValue: {
    color: COLORS.accent,
  },
  vetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  vetText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  editLink: {
    alignSelf: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  editText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: '600',
  },
});
