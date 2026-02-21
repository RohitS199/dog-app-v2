// Client-side emergency keyword detection engine
// Runs with 500ms debounce on symptom input
// These patterns trigger an immediate emergency alert banner BEFORE submission

const SINGLE_WORD_PATTERNS = [
  'unresponsive',
  'unconscious',
  'seizure',
  'seizures',
  'seizing',
  'convulsion',
  'convulsions',
  'convulsing',
  'poisoned',
  'poison',
  'poisoning',
  'toxin',
  'toxic',
  'bloat',
  'bloated',
  'bloating',
  'gdv',
  'choking',
  'choked',
  'suffocating',
  'drowning',
  'drowned',
  'electrocuted',
  'electrocution',
  'heatstroke',
  'hypothermia',
  'hemorrhage',
  'hemorrhaging',
  'bleeding',
  'antifreeze',
  'xylitol',
  'chocolate',
  'rat poison',
  'snail bait',
  'slug bait',
];

// Multi-word compound patterns — all words must be present
const COMPOUND_PATTERNS = [
  ['not', 'breathing'],
  ['stopped', 'breathing'],
  ['cant', 'breathe'],
  ["can't", 'breathe'],
  ['cannot', 'breathe'],
  ['difficulty', 'breathing'],
  ['struggling', 'breathe'],
  ['gasping', 'air'],
  ['hit', 'car'],
  ['hit by', 'car'],
  ['run', 'over'],
  ['fell', 'from'],
  ['collapsed', 'not moving'],
  ['not', 'moving'],
  ['not', 'responding'],
  ['blue', 'gums'],
  ['pale', 'gums'],
  ['white', 'gums'],
  ['heavy', 'bleeding'],
  ['wont', 'wake'],
  ["won't", 'wake'],
  ['ate', 'poison'],
  ['swallowed', 'object'],
  ['swallowed', 'foreign'],
  ['stomach', 'twisted'],
  ['stomach', 'swollen'],
  ['distended', 'abdomen'],
  ['trying', 'vomit', 'nothing'],
  ['retching', 'nothing'],
  ['non', 'productive', 'retching'],
  ['grey', 'gums'],
  ['gray', 'gums'],
  ['cannot', 'move'],
  ['cannot', 'use', 'legs'],
  ["can't", 'use', 'legs'],
  ['is', 'not', 'breathing'],
  ["isn't", 'breathing'],
  ['blood', 'stool'],
  ['blood', 'poop'],
  ['blood', 'feces'],
  ['hind', 'legs', 'dragging'],
  ['back', 'legs', 'dragging'],
  ['back', 'legs', 'not', 'working'],
  ['stuck', 'throat'],
];

// Symptom clusters — if N+ of these appear together, flag as emergency
const SYMPTOM_CLUSTERS = [
  {
    keywords: ['vomiting', 'vomit', 'diarrhea', 'lethargy', 'lethargic', 'blood'],
    minMatches: 3,
  },
  {
    keywords: ['swollen', 'belly', 'pacing', 'restless', 'drooling'],
    minMatches: 3,
  },
  {
    keywords: ['weak', 'collapse', 'pale', 'cold'],
    minMatches: 3,
  },
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u0060\u00B4]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface EmergencyDetectionResult {
  isEmergency: boolean;
  matchedPatterns: string[];
}

export function detectEmergencyKeywords(
  rawText: string
): EmergencyDetectionResult {
  if (!rawText.trim()) {
    return { isEmergency: false, matchedPatterns: [] };
  }

  const text = normalizeText(rawText);
  const matchedPatterns: string[] = [];

  // Check single-word patterns
  for (const pattern of SINGLE_WORD_PATTERNS) {
    const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      matchedPatterns.push(pattern);
    }
  }

  // Check compound patterns (all words must be present)
  for (const compound of COMPOUND_PATTERNS) {
    const allPresent = compound.every((word) => {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(text);
    });
    if (allPresent) {
      matchedPatterns.push(compound.join(' + '));
    }
  }

  // Check symptom clusters
  for (const cluster of SYMPTOM_CLUSTERS) {
    const matches = cluster.keywords.filter((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(text);
    });
    if (matches.length >= cluster.minMatches) {
      matchedPatterns.push(`cluster: ${matches.join(', ')}`);
    }
  }

  return {
    isEmergency: matchedPatterns.length > 0,
    matchedPatterns,
  };
}
