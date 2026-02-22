// Check-in question definitions matching PRD Section 3.1.1
// Display text and ordering managed here

import type { MetricField, AdditionalSymptom } from '../types/checkIn';

export interface CheckInOption {
  value: string;
  label: string;
}

export interface CheckInQuestion {
  id: MetricField;
  question: string;
  options: CheckInOption[];
}

export const CHECK_IN_QUESTIONS: CheckInQuestion[] = [
  {
    id: 'appetite',
    question: 'How is your dog\'s appetite today?',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'less', label: 'Eating less than usual' },
      { value: 'barely', label: 'Barely eating' },
      { value: 'refusing', label: 'Refusing food' },
      { value: 'more', label: 'Eating more than usual' },
    ],
  },
  {
    id: 'water_intake',
    question: 'How much water is your dog drinking?',
    options: [
      { value: 'normal', label: 'Normal amount' },
      { value: 'less', label: 'Less than usual' },
      { value: 'much_less', label: 'Much less than usual' },
      { value: 'more', label: 'More than usual' },
      { value: 'excessive', label: 'Excessively drinking' },
    ],
  },
  {
    id: 'energy_level',
    question: 'What is your dog\'s energy level?',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'low', label: 'Lower than usual' },
      { value: 'lethargic', label: 'Lethargic' },
      { value: 'barely_moving', label: 'Barely moving' },
      { value: 'hyperactive', label: 'Unusually hyperactive' },
    ],
  },
  {
    id: 'stool_quality',
    question: 'How are your dog\'s stools?',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'soft', label: 'Soft or loose' },
      { value: 'diarrhea', label: 'Diarrhea' },
      { value: 'constipated', label: 'Constipated' },
      { value: 'blood', label: 'Blood in stool' },
      { value: 'not_noticed', label: 'Haven\'t noticed' },
    ],
  },
  {
    id: 'vomiting',
    question: 'Has your dog vomited today?',
    options: [
      { value: 'none', label: 'No vomiting' },
      { value: 'once', label: 'Once' },
      { value: 'multiple', label: 'Multiple times' },
      { value: 'dry_heaving', label: 'Dry heaving' },
    ],
  },
  {
    id: 'mobility',
    question: 'How is your dog moving around?',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'stiff', label: 'A bit stiff' },
      { value: 'limping', label: 'Limping' },
      { value: 'reluctant', label: 'Reluctant to move' },
      { value: 'difficulty_rising', label: 'Difficulty getting up' },
    ],
  },
  {
    id: 'mood',
    question: 'How is your dog\'s mood and behavior?',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'quiet', label: 'Quieter than usual' },
      { value: 'anxious', label: 'Anxious or restless' },
      { value: 'clingy', label: 'Clingy or needy' },
      { value: 'hiding', label: 'Hiding or withdrawn' },
      { value: 'aggressive', label: 'Unusually aggressive' },
    ],
  },
];

export interface AdditionalSymptomOption {
  value: AdditionalSymptom;
  label: string;
}

export const ADDITIONAL_SYMPTOMS_OPTIONS: AdditionalSymptomOption[] = [
  { value: 'coughing', label: 'Coughing' },
  { value: 'sneezing', label: 'Sneezing' },
  { value: 'scratching', label: 'Excessive scratching' },
  { value: 'eye_discharge', label: 'Eye discharge' },
  { value: 'nasal_discharge', label: 'Nasal discharge' },
  { value: 'ear_issues', label: 'Ear issues' },
  { value: 'skin_changes', label: 'Skin changes' },
  { value: 'lumps', label: 'New lumps or bumps' },
  { value: 'bad_breath', label: 'Bad breath' },
  { value: 'excessive_panting', label: 'Excessive panting' },
  { value: 'none', label: 'None of these' },
];
