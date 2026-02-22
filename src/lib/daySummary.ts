// Pure function: classifies a single day's check-in into summary tiers
// per PRD Section 3.2.1 abnormality classification

import type { DailyCheckIn } from '../types/checkIn';
import type { DaySummary } from '../types/health';

interface AbnormalityResult {
  field: string;
  value: string;
  severity: 'mild' | 'significant' | 'flag';
  label: string;
}

/**
 * Classifies each field's value per PRD Section 3.2.1 abnormality table.
 */
function classifyAbnormalities(checkIn: DailyCheckIn): AbnormalityResult[] {
  const results: AbnormalityResult[] = [];

  // Appetite
  if (checkIn.appetite === 'less') {
    results.push({ field: 'appetite', value: checkIn.appetite, severity: 'mild', label: 'Eating less than usual' });
  } else if (checkIn.appetite === 'barely' || checkIn.appetite === 'refusing') {
    results.push({ field: 'appetite', value: checkIn.appetite, severity: 'significant', label: checkIn.appetite === 'barely' ? 'Barely eating' : 'Refusing food' });
  } else if (checkIn.appetite === 'more') {
    results.push({ field: 'appetite', value: checkIn.appetite, severity: 'flag', label: 'Eating more than usual (polyphagia)' });
  }

  // Water intake
  if (checkIn.water_intake === 'less' || checkIn.water_intake === 'more') {
    results.push({ field: 'water_intake', value: checkIn.water_intake, severity: 'mild', label: checkIn.water_intake === 'less' ? 'Drinking less water' : 'Drinking more water' });
  } else if (checkIn.water_intake === 'much_less' || checkIn.water_intake === 'excessive') {
    results.push({ field: 'water_intake', value: checkIn.water_intake, severity: 'significant', label: checkIn.water_intake === 'much_less' ? 'Drinking much less water' : 'Excessively drinking water' });
  }

  // Energy level
  if (checkIn.energy_level === 'low') {
    results.push({ field: 'energy_level', value: checkIn.energy_level, severity: 'mild', label: 'Lower energy than usual' });
  } else if (checkIn.energy_level === 'lethargic' || checkIn.energy_level === 'barely_moving') {
    results.push({ field: 'energy_level', value: checkIn.energy_level, severity: 'significant', label: checkIn.energy_level === 'lethargic' ? 'Lethargic' : 'Barely moving' });
  } else if (checkIn.energy_level === 'hyperactive') {
    results.push({ field: 'energy_level', value: checkIn.energy_level, severity: 'flag', label: 'Unusually hyperactive' });
  }

  // Stool quality
  if (checkIn.stool_quality === 'soft') {
    results.push({ field: 'stool_quality', value: checkIn.stool_quality, severity: 'mild', label: 'Soft or loose stools' });
  } else if (checkIn.stool_quality === 'diarrhea') {
    results.push({ field: 'stool_quality', value: checkIn.stool_quality, severity: 'significant', label: 'Diarrhea' });
  } else if (checkIn.stool_quality === 'blood') {
    results.push({ field: 'stool_quality', value: checkIn.stool_quality, severity: 'significant', label: 'Blood in stool' });
  }
  // constipated and not_noticed are tracked but not alarming as single-day events

  // Vomiting
  if (checkIn.vomiting === 'once') {
    results.push({ field: 'vomiting', value: checkIn.vomiting, severity: 'mild', label: 'Vomited once' });
  } else if (checkIn.vomiting === 'multiple') {
    results.push({ field: 'vomiting', value: checkIn.vomiting, severity: 'significant', label: 'Vomited multiple times' });
  } else if (checkIn.vomiting === 'dry_heaving') {
    results.push({ field: 'vomiting', value: checkIn.vomiting, severity: 'significant', label: 'Dry heaving' });
  }

  // Mobility
  if (checkIn.mobility === 'stiff') {
    results.push({ field: 'mobility', value: checkIn.mobility, severity: 'mild', label: 'A bit stiff' });
  } else if (checkIn.mobility === 'limping' || checkIn.mobility === 'reluctant' || checkIn.mobility === 'difficulty_rising') {
    const labels: Record<string, string> = {
      limping: 'Limping',
      reluctant: 'Reluctant to move',
      difficulty_rising: 'Difficulty getting up',
    };
    results.push({ field: 'mobility', value: checkIn.mobility, severity: 'significant', label: labels[checkIn.mobility] });
  }

  // Mood
  if (checkIn.mood === 'quiet' || checkIn.mood === 'clingy') {
    results.push({ field: 'mood', value: checkIn.mood, severity: 'mild', label: checkIn.mood === 'quiet' ? 'Quieter than usual' : 'Clingy or needy' });
  } else if (checkIn.mood === 'anxious' || checkIn.mood === 'hiding') {
    results.push({ field: 'mood', value: checkIn.mood, severity: 'significant', label: checkIn.mood === 'anxious' ? 'Anxious or restless' : 'Hiding or withdrawn' });
  } else if (checkIn.mood === 'aggressive') {
    results.push({ field: 'mood', value: checkIn.mood, severity: 'significant', label: 'Unusually aggressive' });
  }

  return results;
}

/**
 * Generates a day summary from a check-in's structured answers.
 *
 * Summary tiers:
 * - all_normal: All baselines
 * - minor_notes: Only mild abnormalities
 * - attention_needed: At least one significant abnormality
 * - vet_recommended: Dry heaving, blood in stool, or 3+ significant abnormalities
 */
export function generateDaySummary(checkIn: DailyCheckIn): DaySummary {
  const abnormalities = classifyAbnormalities(checkIn);

  if (abnormalities.length === 0) {
    return {
      type: 'all_normal',
      message: 'Everything looks normal today! Keep up the great care.',
      abnormalities: [],
    };
  }

  const significantCount = abnormalities.filter(a => a.severity === 'significant').length;
  const hasBloodInStool = checkIn.stool_quality === 'blood';
  const hasDryHeaving = checkIn.vomiting === 'dry_heaving';
  const abnormalityLabels = abnormalities.map(a => a.label);

  // Vet recommended: dry heaving, blood in stool, or 3+ significant
  if (hasDryHeaving || hasBloodInStool || significantCount >= 3) {
    let message = 'We recommend contacting your vet.';
    if (hasDryHeaving) {
      message = 'Dry heaving can be a sign of bloat, which is a medical emergency. Contact your vet immediately.';
    } else if (hasBloodInStool) {
      message = 'Blood in stool should be evaluated by a vet. Please schedule a visit.';
    } else {
      message = 'Multiple concerning symptoms detected today. We recommend contacting your vet.';
    }

    return {
      type: 'vet_recommended',
      message,
      abnormalities: abnormalityLabels,
    };
  }

  // Attention needed: at least one significant
  if (significantCount > 0) {
    return {
      type: 'attention_needed',
      message: 'Some symptoms need attention. Keep monitoring and contact your vet if they persist.',
      abnormalities: abnormalityLabels,
    };
  }

  // Minor notes: only mild
  return {
    type: 'minor_notes',
    message: 'A few things to keep an eye on, but nothing alarming right now.',
    abnormalities: abnormalityLabels,
  };
}
