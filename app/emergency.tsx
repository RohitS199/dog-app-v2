import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDogStore } from '../src/stores/dogStore';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import { DisclaimerFooter } from '../src/components/legal';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../src/constants/theme';
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
          style={[styles.backCircle, SHADOWS.subtle]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
        </Pressable>

        <Text style={styles.title}>Emergency</Text>
        <Text style={styles.subtitle}>
          If your dog needs immediate help, take action now.
        </Text>

        {/* Call Your Vet */}
        {selectedDog?.vet_phone ? (
          <Pressable
            style={({ pressed }) => [styles.vetCard, pressed && styles.pressed]}
            onPress={() => Linking.openURL(`tel:${selectedDog.vet_phone}`)}
            accessibilityRole="button"
            accessibilityLabel={`Call your vet at ${selectedDog.vet_phone}`}
          >
            <MaterialCommunityIcons name="phone" size={24} color="#FFFFFF" />
            <View style={styles.vetCardText}>
              <Text style={styles.vetCardTitle}>Call Your Vet</Text>
              <Text style={styles.vetCardSub}>{selectedDog.vet_phone}</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.noVetCard}>
            <MaterialCommunityIcons name="phone-off" size={20} color={COLORS.textSecondary} />
            <Text style={styles.noVetText}>
              No vet phone number on file. Add one in your dog's profile so it's ready when you need it.
            </Text>
          </View>
        )}

        {/* Find Emergency Vet */}
        <Pressable
          style={({ pressed }) => [styles.emergencyCard, pressed && styles.pressed]}
          onPress={() => Linking.openURL(EMERGENCY.SEARCH_EMERGENCY_VET_URL)}
          accessibilityRole="button"
          accessibilityLabel="Find emergency vet near you"
        >
          <MaterialCommunityIcons name="map-marker-radius" size={24} color="#FFFFFF" />
          <View style={styles.vetCardText}>
            <Text style={styles.emergencyCardTitle}>Find Emergency Vet Near You</Text>
            <Text style={styles.emergencyCardSub}>Opens search in your browser</Text>
          </View>
        </Pressable>

        {/* ASPCA Poison Control */}
        <Pressable
          style={({ pressed }) => [styles.aspcaCard, pressed && styles.pressed]}
          onPress={() => Linking.openURL(`tel:${EMERGENCY.ASPCA_POISON_CONTROL}`)}
          accessibilityRole="button"
          accessibilityLabel={`Call ASPCA Poison Control at ${EMERGENCY.ASPCA_POISON_CONTROL}`}
        >
          <View style={styles.aspcaIcon}>
            <MaterialCommunityIcons name="phone" size={18} color={COLORS.emergency} />
          </View>
          <View style={styles.aspcaContent}>
            <Text style={styles.aspcaTitle}>ASPCA Poison Control</Text>
            <Text style={styles.aspcaNumber}>{EMERGENCY.ASPCA_POISON_CONTROL}</Text>
            <Text style={styles.aspcaNote}>
              Available 24/7 · A $75 consultation fee may apply
            </Text>
          </View>
        </Pressable>

        {!isConnected && (
          <View style={styles.offlineCard} accessibilityRole="alert">
            <MaterialCommunityIcons name="wifi-off" size={20} color={COLORS.warning} />
            <View style={styles.offlineContent}>
              <Text style={styles.offlineTitle}>You're Offline</Text>
              <Text style={styles.offlineText}>
                You can still call your vet or ASPCA Poison Control. The phone dialer works without internet.
              </Text>
            </View>
          </View>
        )}

        {/* While Waiting */}
        <View style={[styles.tipsCard, SHADOWS.card]}>
          <Text style={styles.tipsTitle}>While waiting for help:</Text>
          {[
            'Stay calm — your dog can sense your stress',
            'Keep your dog warm and still',
            "Don't give food, water, or medication unless your vet tells you to",
            'Note the time symptoms started',
            'If poisoning is suspected, bring the packaging to the vet',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>{'\u2022'}</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <DisclaimerFooter />
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
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: COLORS.emergency,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  // Vet card
  vetCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  vetCardText: {
    flex: 1,
  },
  vetCardTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  vetCardSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  noVetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  noVetText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  // Emergency card
  emergencyCard: {
    backgroundColor: COLORS.emergency,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  emergencyCardTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  emergencyCardSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  // ASPCA card
  aspcaCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.emergency,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  aspcaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aspcaContent: {
    flex: 1,
  },
  aspcaTitle: {
    color: COLORS.emergency,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  aspcaNumber: {
    color: COLORS.emergency,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginTop: 2,
  },
  aspcaNote: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
  // Offline
  offlineCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.warning,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  offlineContent: {
    flex: 1,
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
  // Tips
  tipsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  tipsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
    paddingRight: SPACING.md,
  },
  tipBullet: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
    lineHeight: 22,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
});
