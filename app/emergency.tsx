import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDogStore } from '../src/stores/dogStore';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../src/constants/theme';
import { EMERGENCY } from '../src/constants/config';

export default function EmergencyScreen() {
  const router = useRouter();
  const isConnected = useNetworkStatus();
  const { dogs, selectedDogId } = useDogStore();
  const selectedDog = dogs.find((d) => d.id === selectedDogId);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Emergency</Text>
          <Text style={styles.subtitle}>
            If your dog needs immediate help, take action now.
          </Text>
        </View>

        {/* Call Your Vet */}
        {selectedDog?.vet_phone ? (
          <Pressable
            style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            onPress={() => Linking.openURL(`tel:${selectedDog.vet_phone}`)}
            accessibilityRole="button"
            accessibilityLabel={`Call your vet at ${selectedDog.vet_phone}`}
          >
            <Text style={styles.primaryActionTitle}>Call Your Vet</Text>
            <Text style={styles.primaryActionSub}>{selectedDog.vet_phone}</Text>
          </Pressable>
        ) : (
          <View style={styles.noVetCard}>
            <Text style={styles.noVetText}>
              No vet phone number on file. Add one in your dog's profile so it's
              ready when you need it.
            </Text>
          </View>
        )}

        {/* Find Emergency Vet */}
        <Pressable
          style={({ pressed }) => [styles.emergencyAction, pressed && styles.pressed]}
          onPress={() => Linking.openURL(EMERGENCY.SEARCH_EMERGENCY_VET_URL)}
          accessibilityRole="button"
          accessibilityLabel="Find emergency vet near you"
        >
          <Text style={styles.emergencyActionTitle}>
            Find Emergency Vet Near You
          </Text>
          <Text style={styles.emergencyActionSub}>
            Opens search in your browser
          </Text>
        </Pressable>

        {/* ASPCA Poison Control */}
        <Pressable
          style={({ pressed }) => [styles.poisonAction, pressed && styles.pressed]}
          onPress={() => Linking.openURL(`tel:${EMERGENCY.ASPCA_POISON_CONTROL}`)}
          accessibilityRole="button"
          accessibilityLabel={`Call ASPCA Poison Control at ${EMERGENCY.ASPCA_POISON_CONTROL}`}
        >
          <Text style={styles.poisonTitle}>ASPCA Poison Control</Text>
          <Text style={styles.poisonNumber}>{EMERGENCY.ASPCA_POISON_CONTROL}</Text>
          <Text style={styles.poisonNote}>
            Available 24/7 · A $75 consultation fee may apply
          </Text>
        </Pressable>

        {!isConnected && (
          <View style={styles.offlineCard} accessibilityRole="alert">
            <Text style={styles.offlineTitle}>You're Offline</Text>
            <Text style={styles.offlineText}>
              You can still call your vet or ASPCA Poison Control using the
              buttons above. The phone dialer works without internet.
            </Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>While waiting for help:</Text>
          <Text style={styles.infoText}>
            • Stay calm — your dog can sense your stress{'\n'}
            • Keep your dog warm and still{'\n'}
            • Don't give food, water, or medication unless your vet tells you to
            {'\n'}
            • Note the time symptoms started{'\n'}
            • If poisoning is suspected, bring the packaging to the vet
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.emergency,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  primaryAction: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    minHeight: 64,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  primaryActionTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  primaryActionSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  noVetCard: {
    backgroundColor: COLORS.divider,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  noVetText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emergencyAction: {
    backgroundColor: COLORS.emergency,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    minHeight: 64,
    justifyContent: 'center',
  },
  emergencyActionTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  emergencyActionSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  poisonAction: {
    backgroundColor: '#FFEBEE',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.emergency,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    minHeight: 64,
    justifyContent: 'center',
  },
  poisonTitle: {
    color: COLORS.emergency,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  poisonNumber: {
    color: COLORS.emergency,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginTop: 2,
  },
  poisonNote: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
  offlineCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  offlineTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  offlineText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
});
