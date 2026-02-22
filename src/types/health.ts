// Health tracking, pattern alerts, and calendar types

export type PatternType =
  | 'appetite_decline'
  | 'energy_decline'
  | 'digestive_issues'
  | 'recurring_vomiting'
  | 'abnormal_water'
  | 'mobility_issues'
  | 'behavioral_change'
  | 'multi_symptom_acute'
  | 'multi_symptom_trend'
  | 'persistent_decline'
  | 'blood_in_stool'
  | 'vomiting_plus_other'
  | 'appetite_thirst_increase'
  | 'appetite_increase'
  | 'excessive_energy'
  | 'sudden_aggression'
  | 'dry_heaving_emergency';

export type AlertLevel = 'info' | 'watch' | 'concern' | 'vet_recommended';

export interface PatternAlert {
  id: string;
  user_id: string;
  dog_id: string;
  pattern_type: PatternType;
  alert_level: AlertLevel;
  title: string;
  message: string;
  ai_insight: string | null;
  data_window: Record<string, unknown>;
  is_active: boolean;
  dismissed_by_user: boolean;
  triggered_triage: boolean;
  first_detected: string;
  last_confirmed: string;
  resolved_at: string | null;
  created_at: string;
}

// Calendar day status for the health calendar grid
export type CalendarDayStatus =
  | 'good'    // Consistency score 4-5: green circle
  | 'fair'    // Consistency score 2-3: amber triangle
  | 'poor'    // Consistency score 1: red diamond
  | 'new'     // Days 1-4 (insufficient history): blue outlined circle
  | 'missed'  // No check-in logged: gray dash
  | 'future'; // Future date: nothing rendered

export interface ConsistencyScore {
  score: number;       // 1-5 scale
  matchCount: number;  // How many of 7 fields matched their mode
  totalFields: number; // Always 7
}

export type DaySummaryType = 'all_normal' | 'minor_notes' | 'attention_needed' | 'vet_recommended';

export interface DaySummary {
  type: DaySummaryType;
  message: string;
  abnormalities: string[];
}

export interface AnalyzePatternsResponse {
  patterns: PatternAlert[];
  summary: string;
  density: {
    logged: number;
    window: number;
  };
}
