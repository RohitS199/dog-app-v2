import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_SPACING,
} from '../../constants/onboardingTheme';

interface SignaturePadProps {
  onPathChange: (data: string) => void;
  pathData: string | null;
}

interface Point {
  x: number;
  y: number;
}

function buildSvgPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    path += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
  }

  // Connect to the last point
  const last = points[points.length - 1];
  path += ` L ${last.x} ${last.y}`;

  return path;
}

export function SignaturePad({ onPathChange, pathData }: SignaturePadProps) {
  const pointsRef = useRef<Point[]>([]);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onStart((event) => {
      pointsRef.current = [{ x: event.x, y: event.y }];
      onPathChange(buildSvgPath(pointsRef.current));
    })
    .onUpdate((event) => {
      pointsRef.current.push({ x: event.x, y: event.y });
      onPathChange(buildSvgPath(pointsRef.current));
    })
    .onEnd(() => {
      // Path is finalized, no action needed
    });

  const handleClear = useCallback(() => {
    pointsRef.current = [];
    onPathChange('');
  }, [onPathChange]);

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel="Draw your signature"
      accessibilityRole="none"
    >
      <GestureDetector gesture={panGesture}>
        <View style={styles.canvas}>
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            {pathData ? (
              <Path
                d={pathData}
                stroke={OB_COLORS.ink}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </Svg>
        </View>
      </GestureDetector>

      {pathData ? (
        <Pressable
          onPress={handleClear}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear signature"
          hitSlop={8}
        >
          <Text style={styles.clearText}>clear</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  canvas: {
    height: 34,
    borderBottomWidth: 2,
    borderBottomColor: OB_COLORS.muted,
    backgroundColor: 'transparent',
  },
  clearButton: {
    alignSelf: 'flex-end',
    paddingVertical: OB_SPACING.mt1,
    paddingHorizontal: OB_SPACING.mt2,
    minHeight: 28,
    justifyContent: 'center',
  },
  clearText: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.muted,
  },
});
