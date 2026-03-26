import { useCallback, useMemo, useState } from 'react';
import { Dimensions, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  useReducedMotion,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PatternAlertCard } from './PatternAlertCard';
import {
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  FONTS,
  SHADOWS,
  MIN_TOUCH_TARGET,
  CALENDAR_STATUS_CONFIG,
} from '../../constants/theme';
import type { PatternAlert } from '../../types/health';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 800;
const MAX_VISIBLE = 3;
const STACK_OFFSET_Y = 8;
const STACK_SCALE_STEP = 0.05;
const STACK_OPACITY_STEP = 0.15;

interface AlertCardStackProps {
  alerts: PatternAlert[];
  onDismiss: (alertId: string) => void;
}

export function AlertCardStack({ alerts, onDismiss }: AlertCardStackProps) {
  const [cardHeight, setCardHeight] = useState(180);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const reducedMotion = useReducedMotion();
  const translateX = useSharedValue(0);

  // Visible alerts = all alerts minus locally swiped ones
  const visibleAlerts = useMemo(
    () => alerts.filter((a) => !swipedIds.has(a.id)),
    [alerts, swipedIds],
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setCardHeight(height);
    }
  }, []);

  // Swipe dismiss — local only (can be reviewed again)
  const handleSwipeDismiss = useCallback(
    (alertId: string) => {
      translateX.value = 0;
      setSwipedIds((prev) => new Set(prev).add(alertId));
    },
    [translateX],
  );

  // Tap dismiss — permanent (calls store)
  const handleTapDismiss = useCallback(
    (alertId: string) => {
      translateX.value = 0;
      onDismiss(alertId);
    },
    [onDismiss, translateX],
  );

  // Review again — reset local swiped state
  const handleReviewAgain = useCallback(() => {
    setSwipedIds(new Set());
  }, []);

  // MUST be called before any early return (Rules of Hooks)
  const topCardAnimatedStyle = useAnimatedStyle(() => {
    const rotation = (translateX.value / SCREEN_WIDTH) * 10;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: -Math.abs(translateX.value) * 0.02 },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  // Celebration state — all alerts swiped or none exist
  if (visibleAlerts.length === 0) {
    const hasSwiped = swipedIds.size > 0;
    return (
      <View>
        <Animated.View style={styles.celebrationCard}>
          <LottieView
            source={require('../../../assets/caught-up-corgi.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.celebrationTitle}>You're all caught up!</Text>
          <Text style={styles.celebrationSubtitle}>No active pattern alerts</Text>
          {hasSwiped && (
            <Pressable
              style={styles.reviewButton}
              onPress={handleReviewAgain}
              accessibilityRole="button"
              accessibilityLabel="Review alerts again"
            >
              <MaterialCommunityIcons
                name="refresh"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text style={styles.reviewButtonText}>Review again</Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    );
  }

  const topAlert = visibleAlerts[0];

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const shouldDismiss =
        Math.abs(event.translationX) > SWIPE_THRESHOLD ||
        Math.abs(event.velocityX) > VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        const direction = event.translationX > 0 ? 1 : -1;
        const duration = reducedMotion ? 0 : 250;
        translateX.value = withTiming(direction * SCREEN_WIDTH, { duration }, () => {
          runOnJS(handleSwipeDismiss)(topAlert.id);
        });
      } else {
        translateX.value = reducedMotion
          ? 0
          : withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const containerHeight = cardHeight + (Math.min(visibleAlerts.length - 1, MAX_VISIBLE - 1)) * STACK_OFFSET_Y;

  return (
    <View>
      {/* Counter */}
      <Text
        style={styles.counter}
        accessibilityLabel={`Alert ${1} of ${visibleAlerts.length}`}
      >
        1 of {visibleAlerts.length}
      </Text>

      {/* Card stack container */}
      <View style={{ height: containerHeight }}>
        {/* Background cards (rendered bottom-up, z-index ascending) */}
        {visibleAlerts.slice(1, MAX_VISIBLE).map((alert, i) => {
          const stackIndex = i + 1;
          const scale = 1 - stackIndex * STACK_SCALE_STEP;
          const translateY = stackIndex * STACK_OFFSET_Y;
          const opacity = 1 - stackIndex * STACK_OPACITY_STEP;

          return (
            <View
              key={alert.id}
              style={[
                styles.stackedCard,
                {
                  zIndex: MAX_VISIBLE - stackIndex,
                  transform: [{ scale }, { translateY }],
                  opacity,
                },
              ]}
              pointerEvents="none"
            >
              <PatternAlertCard alert={alert} onDismiss={handleTapDismiss} />
            </View>
          );
        })}

        {/* Top card — swipeable */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[styles.stackedCard, { zIndex: MAX_VISIBLE }, topCardAnimatedStyle]}
            onLayout={handleLayout}
          >
            <PatternAlertCard alert={topAlert} onDismiss={handleTapDismiss} />
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  counter: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stackedCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  lottie: {
    width: 180,
    height: 180,
  },
  celebrationCard: {
    backgroundColor: CALENDAR_STATUS_CONFIG.good.backgroundColor,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  celebrationTitle: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.lg,
    color: COLORS.success,
    marginTop: SPACING.md,
  },
  celebrationSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  reviewButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
});
