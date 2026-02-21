import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';
import { EMERGENCY } from '../../constants/config';

interface EmergencyCallBannerProps {
  showPoisonControl?: boolean;
}

export function EmergencyCallBanner({ showPoisonControl }: EmergencyCallBannerProps) {
  const handleCallVet = () => {
    // Opens browser to search for emergency vet
    Linking.openURL(EMERGENCY.SEARCH_EMERGENCY_VET_URL);
  };

  const handleCallPoisonControl = () => {
    Linking.openURL(`tel:${EMERGENCY.ASPCA_POISON_CONTROL}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        If your dog needs immediate help:
      </Text>

      <Pressable
        style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
        onPress={handleCallVet}
        accessibilityRole="button"
        accessibilityLabel="Find emergency vet near you"
      >
        <Text style={styles.callButtonText}>Find Emergency Vet Near You</Text>
        <Text style={styles.callSubtext}>Opens search in your browser</Text>
      </Pressable>

      {showPoisonControl && (
        <Pressable
          style={({ pressed }) => [
            styles.poisonButton,
            pressed && styles.pressed,
          ]}
          onPress={handleCallPoisonControl}
          accessibilityRole="button"
          accessibilityLabel={`Call ASPCA Poison Control at ${EMERGENCY.ASPCA_POISON_CONTROL}`}
        >
          <Text style={styles.poisonButtonText}>
            ASPCA Poison Control
          </Text>
          <Text style={styles.poisonNumber}>
            {EMERGENCY.ASPCA_POISON_CONTROL}
          </Text>
          <Text style={styles.poisonNote}>
            A $75 consultation fee may apply
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  headerText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  callButton: {
    backgroundColor: COLORS.emergency,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  callSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  poisonButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.emergency,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  poisonButtonText: {
    color: COLORS.emergency,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  poisonNumber: {
    color: COLORS.emergency,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginTop: 2,
  },
  poisonNote: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: 4,
  },
});
