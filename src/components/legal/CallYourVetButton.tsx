import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';

interface CallYourVetButtonProps {
  vetPhone: string | null;
}

export function CallYourVetButton({ vetPhone }: CallYourVetButtonProps) {
  const handlePress = () => {
    if (vetPhone) {
      Linking.openURL(`tel:${vetPhone}`);
    }
  };

  return (
    <View style={styles.container}>
      {vetPhone ? (
        <Pressable
          style={({ pressed }) => [
            styles.callButton,
            pressed && styles.pressed,
          ]}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={`Call your vet at ${vetPhone}`}
        >
          <Text style={styles.callText}>Call Your Vet</Text>
          <Text style={styles.phoneText}>{vetPhone}</Text>
        </Pressable>
      ) : (
        <View style={styles.noVetContainer}>
          <Text style={styles.noVetText}>
            No vet phone number on file. You can add one in your dog's profile.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  callButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  callText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  phoneText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  noVetContainer: {
    backgroundColor: COLORS.divider,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  noVetText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
