import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { LIMITS } from '../../constants/config';
import { LOADING_TIPS } from '../../constants/loadingTips';

export function LoadingScreen() {
  const [tipIndex, setTipIndex] = useState(0);
  const [showStillWorking, setShowStillWorking] = useState(false);

  useEffect(() => {
    // Rotate tips every 4 seconds
    const tipInterval = setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, 4000);

    // Show "still working" after 15 seconds
    const stillWorkingTimeout = setTimeout(() => {
      setShowStillWorking(true);
    }, LIMITS.LOADING_STILL_WORKING_MS);

    return () => {
      clearInterval(tipInterval);
      clearTimeout(stillWorkingTimeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />

      <Text style={styles.title}>Checking symptoms...</Text>

      <Text style={styles.tip}>{LOADING_TIPS[tipIndex]}</Text>

      {showStillWorking && (
        <Text style={styles.stillWorking}>
          Still working — complex symptoms take a bit longer to analyze.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tip: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    minHeight: 40,
  },
  stillWorking: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
