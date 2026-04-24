import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES } from '../../constants/onboardingTheme';

interface TypewriterTextProps {
  text: string;
  charDelay?: number;
  typingDotsDelay?: number;
  onComplete?: () => void;
  style?: object;
}

export function TypewriterText({
  text,
  charDelay = 24,
  typingDotsDelay = 500,
  onComplete,
  style,
}: TypewriterTextProps) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [showDots, setShowDots] = useState(true);

  useEffect(() => {
    setDisplayedChars(0);
    setShowDots(true);

    // Show typing dots first
    const dotsTimer = setTimeout(() => {
      setShowDots(false);
      // Then reveal characters
      let charIndex = 0;
      const interval = setInterval(() => {
        charIndex += 1;
        setDisplayedChars(charIndex);
        if (charIndex >= text.length) {
          clearInterval(interval);
          onComplete?.();
        }
      }, charDelay);

      return () => clearInterval(interval);
    }, typingDotsDelay);

    return () => clearTimeout(dotsTimer);
  }, [text]);

  if (showDots) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.dots}>...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>
        {text.slice(0, displayedChars)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 20,
  },
  text: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    lineHeight: OB_FONT_SIZES.body * 1.55,
  },
  dots: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.muted,
  },
});
