// Daily check-in type definitions matching daily_check_ins table CHECK constraints

export type Appetite = 'normal' | 'less' | 'barely' | 'refusing' | 'more';
export type WaterIntake = 'normal' | 'less' | 'much_less' | 'more' | 'excessive';
export type EnergyLevel = 'normal' | 'low' | 'lethargic' | 'barely_moving' | 'hyperactive';
export type StoolQuality = 'normal' | 'soft' | 'diarrhea' | 'constipated' | 'blood' | 'not_noticed';
export type Vomiting = 'none' | 'once' | 'multiple' | 'dry_heaving';
export type Mobility = 'normal' | 'stiff' | 'limping' | 'reluctant' | 'difficulty_rising';
export type Mood = 'normal' | 'quiet' | 'anxious' | 'clingy' | 'hiding' | 'aggressive';

export type AdditionalSymptom =
  | 'coughing'
  | 'sneezing'
  | 'scratching'
  | 'eye_discharge'
  | 'nasal_discharge'
  | 'ear_issues'
  | 'skin_changes'
  | 'lumps'
  | 'bad_breath'
  | 'excessive_panting'
  | 'none';

export interface DailyCheckIn {
  id: string;
  user_id: string;
  dog_id: string;
  check_in_date: string;
  appetite: Appetite;
  water_intake: WaterIntake;
  energy_level: EnergyLevel;
  stool_quality: StoolQuality;
  vomiting: Vomiting;
  mobility: Mobility;
  mood: Mood;
  additional_symptoms: AdditionalSymptom[];
  free_text: string | null;
  emergency_flagged: boolean;
  revision_history: RevisionEntry[];
  created_at: string;
  updated_at: string;
}

export interface RevisionEntry {
  timestamp: string;
  snapshot: {
    appetite: Appetite;
    water_intake: WaterIntake;
    energy_level: EnergyLevel;
    stool_quality: StoolQuality;
    vomiting: Vomiting;
    mobility: Mobility;
    mood: Mood;
    additional_symptoms: AdditionalSymptom[];
    free_text: string | null;
  };
}

export interface CheckInDraft {
  dog_id: string;
  check_in_date: string;
  appetite: Appetite | null;
  water_intake: WaterIntake | null;
  energy_level: EnergyLevel | null;
  stool_quality: StoolQuality | null;
  vomiting: Vomiting | null;
  mobility: Mobility | null;
  mood: Mood | null;
  additional_symptoms: AdditionalSymptom[];
  free_text: string | null;
}

// The 7 structured metric field names (excludes additional_symptoms and free_text)
export type MetricField = 'appetite' | 'water_intake' | 'energy_level' | 'stool_quality' | 'vomiting' | 'mobility' | 'mood';

export const METRIC_FIELDS: MetricField[] = [
  'appetite', 'water_intake', 'energy_level', 'stool_quality', 'vomiting', 'mobility', 'mood',
];
