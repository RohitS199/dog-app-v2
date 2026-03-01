import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui/Button';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../src/constants/theme';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['Daily check-ins', 'Health calendar', 'Pattern detection', 'Educational articles'],
    current: true,
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: '/month',
    features: ['Everything in Free', 'AI health insights', 'Weekly health summaries', 'Priority support'],
    current: false,
  },
];

export default function ChoosePlan() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Start free and upgrade anytime
        </Text>

        <View style={styles.plans}>
          {PLANS.map((plan) => (
            <View
              key={plan.name}
              style={[
                styles.planCard,
                SHADOWS.card,
                plan.current && styles.planCardActive,
              ]}
            >
              {plan.current && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current Plan</Text>
                </View>
              )}
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
              {plan.features.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={plan.current ? COLORS.accent : COLORS.textDisabled}
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.comingSoon}>
          <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.comingSoonText}>Premium plans coming soon</Text>
        </View>

        <Button
          title="Continue with Free"
          onPress={() => router.replace('/(tabs)')}
          icon="arrow-right"
        />

        <Pressable
          style={styles.skipLink}
          onPress={() => router.replace('/(tabs)')}
          accessibilityRole="link"
        >
          <Text style={styles.skipText}>Maybe later</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  plans: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  planCardActive: {
    borderColor: COLORS.accent,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentLight,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginBottom: SPACING.sm,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },
  planName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  planPeriod: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  comingSoonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  skipLink: {
    alignSelf: 'center',
    marginTop: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  skipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
