import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';

// Decorative paw print motif for the Profile screen's bottom rest area.
// Purely visual — anchors negative space below the destructive zone so the
// empty vertical space reads as intentional breathing room rather than void.
// Hidden from assistive tech.

const PAW_COLOR = 'rgba(138, 90, 56, 0.28)'; // OB_COLORS.wood @ ~28% — quiet, warm

function PawPrint({ size, rotation }: { size: number; rotation: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ transform: [{ rotate: `${rotation}deg` }] }}
    >
      <Ellipse cx="20" cy="28" rx="11" ry="8.5" fill={PAW_COLOR} />
      <Ellipse cx="8.5" cy="15" rx="4" ry="5" fill={PAW_COLOR} />
      <Ellipse cx="31.5" cy="15" rx="4" ry="5" fill={PAW_COLOR} />
      <Ellipse cx="14.5" cy="6.5" rx="3.5" ry="4.5" fill={PAW_COLOR} />
      <Ellipse cx="25.5" cy="6.5" rx="3.5" ry="4.5" fill={PAW_COLOR} />
    </Svg>
  );
}

export function PawPrintMotif() {
  return (
    <View
      style={styles.container}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <View style={[styles.paw, styles.pawLeft]}>
        <PawPrint size={44} rotation={-18} />
      </View>
      <View style={[styles.paw, styles.pawRight]}>
        <PawPrint size={36} rotation={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: '100%',
    position: 'relative',
  },
  paw: {
    position: 'absolute',
  },
  pawLeft: {
    left: 24,
    top: 8,
  },
  pawRight: {
    right: 36,
    top: 32,
  },
});
