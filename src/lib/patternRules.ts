// Pattern detection rules — pure functions for local testing
// These rules run server-side in the analyze-patterns Edge Function
// but are defined here so they can be tested with the client test suite.

import type { DailyCheckIn } from '../types/checkIn';
import type { PatternType, AlertLevel } from '../types/health';

export interface DetectedPattern {
  patternType: PatternType;
  alertLevel: AlertLevel;
  title: string;
  message: string;
}

// Abnormality severity classification per PRD Section 3.2.1
type Severity = 'baseline' | 'mild' | 'significant' | 'flag';

function classifyAppetite(value: string): Severity {
  if (value === 'normal') return 'baseline';
  if (value === 'less') return 'mild';
  if (value === 'barely' || value === 'refusing') return 'significant';
  if (value === 'more') return 'flag';
  return 'baseline';
}

function classifyWater(value: string): Severity {
  if (value === 'normal') return 'baseline';
  if (value === 'less' || value === 'more') return 'mild';
  if (value === 'much_less' || value === 'excessive') return 'significant';
  return 'baseline';
}

function classifyEnergy(value: string): Severity {
  if (value === 'normal') return 'baseline';
  if (value === 'low') return 'mild';
  if (value === 'lethargic' || value === 'barely_moving') return 'significant';
  if (value === 'hyperactive') return 'flag';
  return 'baseline';
}

function classifyStool(value: string): Severity {
  if (value === 'normal') return 'baseline';
  if (value === 'soft') return 'mild';
  if (value === 'diarrhea' || value === 'blood') return 'significant';
  // constipated and not_noticed are not baseline but not alarming
  return 'baseline';
}

function classifyVomiting(value: string): Severity {
  if (value === 'none') return 'baseline';
  if (value === 'once') return 'mild';
  if (value === 'multiple' || value === 'dry_heaving') return 'significant';
  return 'baseline';
}

function classifyMobility(value: string): Severity {
  if (value === 'normal') return 'baseline';
  if (value === 'stiff') return 'mild';
  if (value === 'limping' || value === 'reluctant' || value === 'difficulty_rising') return 'significant';
  return 'baseline';
}

function classifyMood(value: string): Severity {
  if (value === 'normal') return 'baseline';
  if (value === 'quiet' || value === 'clingy') return 'mild';
  if (value === 'anxious' || value === 'hiding' || value === 'aggressive') return 'significant';
  return 'baseline';
}

function isAbnormal(severity: Severity): boolean {
  return severity !== 'baseline';
}

function countAbnormalFields(checkIn: DailyCheckIn): number {
  let count = 0;
  if (isAbnormal(classifyAppetite(checkIn.appetite))) count++;
  if (isAbnormal(classifyWater(checkIn.water_intake))) count++;
  if (isAbnormal(classifyEnergy(checkIn.energy_level))) count++;
  if (isAbnormal(classifyStool(checkIn.stool_quality))) count++;
  if (isAbnormal(classifyVomiting(checkIn.vomiting))) count++;
  if (isAbnormal(classifyMobility(checkIn.mobility))) count++;
  if (isAbnormal(classifyMood(checkIn.mood))) count++;
  return count;
}

function countSignificantFields(checkIn: DailyCheckIn): number {
  let count = 0;
  if (classifyAppetite(checkIn.appetite) === 'significant') count++;
  if (classifyWater(checkIn.water_intake) === 'significant') count++;
  if (classifyEnergy(checkIn.energy_level) === 'significant') count++;
  if (classifyStool(checkIn.stool_quality) === 'significant') count++;
  if (classifyVomiting(checkIn.vomiting) === 'significant') count++;
  if (classifyMobility(checkIn.mobility) === 'significant') count++;
  if (classifyMood(checkIn.mood) === 'significant') count++;
  return count;
}

/**
 * Detect all pattern rules from a window of check-ins.
 *
 * @param checkIns - Array sorted by check_in_date DESC (most recent first)
 * @param densitySufficient - Whether the density threshold is met (≥70%)
 * @returns Array of detected patterns
 */
export function detectPatterns(
  checkIns: DailyCheckIn[],
  densitySufficient: boolean,
): DetectedPattern[] {
  if (checkIns.length === 0) return [];

  const patterns: DetectedPattern[] = [];
  const today = checkIns[0]; // Most recent
  const compositeDetected = new Set<string>();

  // === SINGLE-DAY RULES (always fire, regardless of density) ===

  // Blood in stool
  if (today.stool_quality === 'blood') {
    patterns.push({
      patternType: 'blood_in_stool',
      alertLevel: 'vet_recommended',
      title: 'Blood in Stool Detected',
      message: 'Blood in your dog\'s stool should be evaluated by a veterinarian. Please schedule a visit.',
    });
  }

  // Dry heaving emergency
  if (today.vomiting === 'dry_heaving') {
    patterns.push({
      patternType: 'dry_heaving_emergency',
      alertLevel: 'vet_recommended',
      title: 'Dry Heaving Detected',
      message: 'Dry heaving can be a sign of bloat (GDV), a life-threatening emergency. Contact your vet immediately.',
    });
  }

  // Sudden aggression
  if (today.mood === 'aggressive') {
    patterns.push({
      patternType: 'sudden_aggression',
      alertLevel: 'concern',
      title: 'Sudden Aggression',
      message: 'Unusual aggression can indicate pain or neurological issues. Consider a vet evaluation.',
    });
  }

  // Vomiting plus other significant symptoms
  if (
    (today.vomiting === 'multiple' || today.vomiting === 'dry_heaving') &&
    countSignificantFields(today) >= 2
  ) {
    patterns.push({
      patternType: 'vomiting_plus_other',
      alertLevel: 'concern',
      title: 'Vomiting with Other Symptoms',
      message: 'Multiple vomiting episodes combined with other symptoms warrants veterinary attention.',
    });
  }

  // Multi-symptom acute (3+ abnormal fields on single day)
  if (countAbnormalFields(today) >= 3) {
    patterns.push({
      patternType: 'multi_symptom_acute',
      alertLevel: 'concern',
      title: 'Multiple Symptoms Detected',
      message: 'Your dog is showing several symptoms today. Monitor closely and consider contacting your vet.',
    });
  }

  // === TREND RULES (require density threshold) ===
  if (!densitySufficient || checkIns.length < 3) {
    return patterns;
  }

  const last3 = checkIns.slice(0, 3);

  // Appetite decline (3+ days of below-normal appetite)
  if (last3.every((c) => classifyAppetite(c.appetite) !== 'baseline')) {
    // Check for composite: appetite + thirst increase
    if (
      last3.every((c) => c.appetite === 'more') &&
      last3.every((c) => c.water_intake === 'excessive' || c.water_intake === 'more')
    ) {
      patterns.push({
        patternType: 'appetite_thirst_increase',
        alertLevel: 'concern',
        title: 'Increased Appetite and Thirst',
        message: 'Persistent increased appetite with increased thirst can indicate diabetes or Cushing\'s disease. Schedule a vet visit.',
      });
      compositeDetected.add('appetite');
    }

    if (!compositeDetected.has('appetite')) {
      if (last3.every((c) => c.appetite === 'more')) {
        patterns.push({
          patternType: 'appetite_increase',
          alertLevel: 'watch',
          title: 'Increased Appetite',
          message: 'Your dog has been eating more than usual for several days. Keep monitoring.',
        });
      } else {
        patterns.push({
          patternType: 'appetite_decline',
          alertLevel: 'watch',
          title: 'Appetite Decline',
          message: 'Your dog\'s appetite has been below normal for 3+ days. Monitor closely.',
        });
      }
    }
  }

  // Energy decline (3+ days of below-normal energy)
  if (last3.every((c) => classifyEnergy(c.energy_level) !== 'baseline')) {
    if (last3.every((c) => c.energy_level === 'hyperactive')) {
      patterns.push({
        patternType: 'excessive_energy',
        alertLevel: 'watch',
        title: 'Persistent Hyperactivity',
        message: 'Your dog has been unusually hyperactive for several days. This may warrant discussion with your vet.',
      });
    } else {
      patterns.push({
        patternType: 'energy_decline',
        alertLevel: 'watch',
        title: 'Energy Level Decline',
        message: 'Your dog\'s energy has been below normal for 3+ days. Consider a vet check if it continues.',
      });
    }
  }

  // Digestive issues (3+ days of abnormal stool)
  if (last3.every((c) => classifyStool(c.stool_quality) !== 'baseline')) {
    patterns.push({
      patternType: 'digestive_issues',
      alertLevel: 'watch',
      title: 'Digestive Issues',
      message: 'Your dog has had abnormal stools for 3+ days. If it continues, consult your vet.',
    });
  }

  // Recurring vomiting (vomiting on 2+ of last 3 days)
  const vomitDays = last3.filter((c) => c.vomiting !== 'none').length;
  if (vomitDays >= 2) {
    patterns.push({
      patternType: 'recurring_vomiting',
      alertLevel: 'concern',
      title: 'Recurring Vomiting',
      message: 'Your dog has been vomiting on multiple days. This pattern should be evaluated by a vet.',
    });
  }

  // Abnormal water intake (3+ days)
  if (last3.every((c) => classifyWater(c.water_intake) !== 'baseline')) {
    patterns.push({
      patternType: 'abnormal_water',
      alertLevel: 'watch',
      title: 'Abnormal Water Intake',
      message: 'Your dog\'s water intake has been unusual for 3+ days. Changes in thirst can indicate various conditions.',
    });
  }

  // Mobility issues (3+ days)
  if (last3.every((c) => classifyMobility(c.mobility) !== 'baseline')) {
    patterns.push({
      patternType: 'mobility_issues',
      alertLevel: 'watch',
      title: 'Mobility Issues',
      message: 'Your dog has been showing mobility concerns for 3+ days. Consider a vet evaluation.',
    });
  }

  // Behavioral change (3+ days)
  if (last3.every((c) => classifyMood(c.mood) !== 'baseline')) {
    patterns.push({
      patternType: 'behavioral_change',
      alertLevel: 'watch',
      title: 'Behavioral Changes',
      message: 'Your dog\'s behavior has been different for 3+ days. Persistent changes can indicate underlying issues.',
    });
  }

  // Multi-symptom trend (2+ abnormal fields consistent for 3+ days)
  const trendFields = ['appetite', 'water_intake', 'energy_level', 'stool_quality', 'vomiting', 'mobility', 'mood'] as const;
  let persistentAbnormal = 0;
  for (const field of trendFields) {
    const classifiers: Record<string, (v: string) => Severity> = {
      appetite: classifyAppetite,
      water_intake: classifyWater,
      energy_level: classifyEnergy,
      stool_quality: classifyStool,
      vomiting: classifyVomiting,
      mobility: classifyMobility,
      mood: classifyMood,
    };
    if (last3.every((c) => isAbnormal(classifiers[field](c[field])))) {
      persistentAbnormal++;
    }
  }
  if (persistentAbnormal >= 2) {
    patterns.push({
      patternType: 'multi_symptom_trend',
      alertLevel: 'concern',
      title: 'Multiple Persistent Symptoms',
      message: 'Multiple symptoms have been consistently abnormal. We recommend a vet consultation.',
    });
  }

  // Persistent decline (check over wider window if available)
  if (checkIns.length >= 7) {
    const last7 = checkIns.slice(0, 7);
    const decliningDays = last7.filter((c) => countAbnormalFields(c) >= 2).length;
    if (decliningDays >= 5) {
      patterns.push({
        patternType: 'persistent_decline',
        alertLevel: 'vet_recommended',
        title: 'Persistent Health Decline',
        message: 'Your dog has shown multiple symptoms on most days over the past week. Please see your vet.',
      });
    }
  }

  return patterns;
}
