// API response types matching the deployed backend contract

export interface TriageSource {
  name: string;
  tier: number;
  url: string;
}

export interface TriageResponse {
  type: 'triage';
  urgency: 'emergency' | 'urgent' | 'soon' | 'monitor';
  headline: string;
  educational_info: string;
  what_to_tell_vet: string[];
  sources: TriageSource[];
  disclaimer: string;
  _debug?: Record<string, unknown>;
}

export interface EmergencyBypassResponse {
  type: 'emergency_bypass';
  urgency: 'emergency';
  headline: string;
  educational_info: string;
  what_to_tell_vet: string[];
  sources: [];
  show_poison_control: boolean;
  poison_control_number: string;
  disclaimer: string;
}

export interface OffTopicResponse {
  type: 'off_topic';
  message: string;
  reason: 'non_dog_animal' | 'human_health' | 'llm_detected';
}

export type CheckSymptomsResponse =
  | TriageResponse
  | EmergencyBypassResponse
  | OffTopicResponse;

export interface CheckSymptomsRequest {
  dog_id: string;
  symptoms: string;
}

export interface Dog {
  id: string;
  user_id: string;
  name: string;
  breed: string;
  age_years: number;
  weight_lbs: number;
  vet_phone: string | null;
  created_at: string;
  updated_at: string;
  last_checkin_date: string | null;
  checkin_streak: number;
  health_summary: HealthSummary | null;
}

export interface HealthSummary {
  summary_text: string;
  notable_events: string[];
  baseline_profile: BaselineProfile;
  annotations: string[];
  last_updated: string;
}

export interface BaselineProfile {
  typical_appetite: 'normal' | 'below_normal' | 'above_normal';
  typical_water_intake: 'normal' | 'below_normal' | 'above_normal';
  typical_energy: 'normal' | 'below_normal' | 'above_normal';
  typical_stool: 'normal' | 'irregular';
  typical_mobility: 'normal' | 'limited';
  typical_mood: 'normal' | 'anxious' | 'quiet';
  vomiting_history_note: string | null;
  known_sensitivities: string[];
}

export interface UserAcknowledgment {
  id: string;
  user_id: string;
  terms_version: string;
  accepted_at: string;
}
