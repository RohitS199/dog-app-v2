import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TriageResponse, EmergencyBypassResponse } from '../../types/api';
import {
  UrgencyBadge,
  DisclaimerFooter,
  SourceCitation,
  CallYourVetButton,
  EmergencyCallBanner,
} from '../legal';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface TriageResultProps {
  result: TriageResponse | EmergencyBypassResponse;
  vetPhone: string | null;
}

export function TriageResult({ result, vetPhone }: TriageResultProps) {
  const isEmergencyBypass = result.type === 'emergency_bypass';
  const showPoisonControl =
    isEmergencyBypass && (result as EmergencyBypassResponse).show_poison_control;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <UrgencyBadge level={result.urgency} size="large" />

      <Text style={styles.headline}>{result.headline}</Text>

      {(result.urgency === 'emergency' || result.urgency === 'urgent') && (
        <View style={styles.section}>
          <EmergencyCallBanner showPoisonControl={showPoisonControl} />
        </View>
      )}

      <CallYourVetButton vetPhone={vetPhone} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What This May Mean</Text>
        <Text style={styles.body}>{result.educational_info}</Text>
      </View>

      {result.what_to_tell_vet.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Tell Your Vet</Text>
          {result.what_to_tell_vet.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {result.type === 'triage' && result.sources.length > 0 && (
        <SourceCitation sources={result.sources} />
      )}

      <DisclaimerFooter text={result.disclaimer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  headline: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  body: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
    paddingRight: SPACING.md,
  },
  bullet: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
});
