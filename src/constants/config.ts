// App-wide configuration constants

export const API = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  CHECK_SYMPTOMS_ENDPOINT: '/functions/v1/check-symptoms',
  DELETE_ACCOUNT_ENDPOINT: '/functions/v1/delete-account',
  ANALYZE_PATTERNS_ENDPOINT: '/functions/v1/analyze-patterns',
} as const;

export const LIMITS = {
  SYMPTOM_MAX_CHARS: 2000,
  RATE_LIMIT_PER_HOUR: 10,
  RATE_LIMIT_PER_DAY: 50,
  EMERGENCY_DEBOUNCE_MS: 500,
  LOADING_MIN_DISPLAY_MS: 3000,
  LOADING_STILL_WORKING_MS: 15000,
  LOADING_TIMEOUT_MS: 30000,
  DOG_AGE_MIN: 0,
  DOG_AGE_MAX: 30,
  COPPA_MIN_AGE: 13,
} as const;

export const CHECK_IN = {
  FREE_TEXT_MAX_CHARS: 500,
  QUESTIONS_COUNT: 9,
  DENSITY_THRESHOLD: 0.7,
  MIN_HISTORY_DAYS: 5,
} as const;

export const EMERGENCY = {
  ASPCA_POISON_CONTROL: '888-426-4435',
  SEARCH_EMERGENCY_VET_URL: 'https://www.google.com/search?q=emergency+vet+near+me',
} as const;

export const LEGAL = {
  DISCLAIMER_TEXT:
    'This app provides educational information only and is not a substitute for professional veterinary advice, diagnosis, or treatment. Always consult a qualified veterinarian for your dog\'s health concerns.',
  TERMS_VERSION: '1.0',
} as const;
