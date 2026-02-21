import { detectEmergencyKeywords } from '../emergencyKeywords';

describe('Emergency Keyword Detection', () => {
  describe('empty and trivial input', () => {
    it('returns false for empty string', () => {
      const result = detectEmergencyKeywords('');
      expect(result.isEmergency).toBe(false);
      expect(result.matchedPatterns).toHaveLength(0);
    });

    it('returns false for whitespace only', () => {
      expect(detectEmergencyKeywords('   ').isEmergency).toBe(false);
    });

    it('returns false for non-emergency text', () => {
      const result = detectEmergencyKeywords('My dog is scratching his ear');
      expect(result.isEmergency).toBe(false);
    });
  });

  describe('single-word patterns', () => {
    it('detects "seizure"', () => {
      const result = detectEmergencyKeywords('My dog is having a seizure');
      expect(result.isEmergency).toBe(true);
      expect(result.matchedPatterns).toContain('seizure');
    });

    it('detects "seizures" (plural)', () => {
      const result = detectEmergencyKeywords('My dog has had multiple seizures today');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "poison"', () => {
      const result = detectEmergencyKeywords('I think my dog ate poison');
      expect(result.isEmergency).toBe(true);
      expect(result.matchedPatterns).toContain('poison');
    });

    it('detects "bloat"', () => {
      const result = detectEmergencyKeywords('Dog stomach looks bloated and hard');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "choking"', () => {
      const result = detectEmergencyKeywords('My dog is choking on something');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "antifreeze"', () => {
      const result = detectEmergencyKeywords('Dog licked antifreeze in the garage');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "xylitol"', () => {
      const result = detectEmergencyKeywords('My dog ate gum with xylitol');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "chocolate"', () => {
      const result = detectEmergencyKeywords('Dog ate a whole bar of chocolate');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "unresponsive"', () => {
      const result = detectEmergencyKeywords('My dog is unresponsive');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "hemorrhaging"', () => {
      const result = detectEmergencyKeywords('Dog is hemorrhaging from a wound');
      expect(result.isEmergency).toBe(true);
    });

    it('does not match partial words', () => {
      // "seize" should not match "seizure" pattern
      const result = detectEmergencyKeywords('I need to seize the opportunity');
      // "seize" is not in the pattern list, only "seizure", "seizures", "seizing"
      expect(result.matchedPatterns).not.toContain('seizure');
    });
  });

  describe('compound patterns', () => {
    it('detects "not breathing"', () => {
      const result = detectEmergencyKeywords('My dog is not breathing');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "stopped breathing"', () => {
      const result = detectEmergencyKeywords('The dog stopped breathing a minute ago');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "hit by car" with words spread in sentence', () => {
      const result = detectEmergencyKeywords('My dog was hit by a car on the street');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "blue gums"', () => {
      const result = detectEmergencyKeywords("My dog's gums are turning blue");
      expect(result.isEmergency).toBe(true);
    });

    it('detects "pale gums"', () => {
      const result = detectEmergencyKeywords('His gums look very pale');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "won\'t wake" with apostrophe', () => {
      const result = detectEmergencyKeywords("My dog won't wake up");
      expect(result.isEmergency).toBe(true);
    });

    it('detects "swallowed object"', () => {
      const result = detectEmergencyKeywords('Dog swallowed a small object');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "cannot move"', () => {
      const result = detectEmergencyKeywords('My dog cannot move at all');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "grey gums" and "gray gums"', () => {
      expect(detectEmergencyKeywords('Her gums look grey').isEmergency).toBe(true);
      expect(detectEmergencyKeywords('His gums are gray').isEmergency).toBe(true);
    });

    it('detects "blood in stool"', () => {
      const result = detectEmergencyKeywords('There is blood in his stool');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "is not breathing" and "isn\'t breathing"', () => {
      expect(detectEmergencyKeywords('My dog is not breathing').isEmergency).toBe(true);
      expect(detectEmergencyKeywords("My dog isn't breathing").isEmergency).toBe(true);
    });

    it('detects "cannot use back legs"', () => {
      const result = detectEmergencyKeywords('He cannot use his back legs at all');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "stuck in throat" (CAT2-09 pattern)', () => {
      const result = detectEmergencyKeywords('Something is stuck in her throat and she keeps pawing at her mouth');
      expect(result.isEmergency).toBe(true);
    });

    it('does not trigger "stuck" in unrelated context', () => {
      const result = detectEmergencyKeywords('My dog got stuck behind the couch');
      expect(result.isEmergency).toBe(false);
    });

    it('detects "white gums"', () => {
      const result = detectEmergencyKeywords('My dog has white gums and seems weak');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "blood in poop" variant', () => {
      const result = detectEmergencyKeywords('I noticed blood in my dogs poop this morning');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "blood in feces" variant', () => {
      const result = detectEmergencyKeywords('There is blood mixed with feces');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "cannot breathe"', () => {
      const result = detectEmergencyKeywords('My dog cannot breathe properly');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "gums look pale" reverse pattern (v9 fix)', () => {
      const result = detectEmergencyKeywords('My dog gums look a little pale but he is eating normally');
      expect(result.isEmergency).toBe(true);
    });

    it('detects "gums are gray" reverse pattern (v9 fix)', () => {
      const result = detectEmergencyKeywords('Her gums are looking gray today');
      expect(result.isEmergency).toBe(true);
    });

    it('does not trigger on unrelated use of "blood"', () => {
      const result = detectEmergencyKeywords('My dog is a bloodhound mix');
      expect(result.isEmergency).toBe(false);
    });
  });

  describe('symptom clusters', () => {
    it('detects cluster: vomiting + diarrhea + lethargy (3 of 4)', () => {
      const result = detectEmergencyKeywords(
        'Dog has been vomiting, has diarrhea, and is very lethargic'
      );
      expect(result.isEmergency).toBe(true);
      expect(result.matchedPatterns.some((p) => p.startsWith('cluster:'))).toBe(true);
    });

    it('does not trigger cluster with only 2 matches', () => {
      const result = detectEmergencyKeywords(
        'Dog has been vomiting and has diarrhea but is otherwise fine'
      );
      // Only 2 of 4 cluster keywords — below threshold of 3
      const clusterMatches = result.matchedPatterns.filter((p) =>
        p.startsWith('cluster:')
      );
      expect(clusterMatches).toHaveLength(0);
    });

    it('detects bloat cluster: swollen + belly + pacing (3 of 5)', () => {
      const result = detectEmergencyKeywords(
        'Dog belly is swollen and she keeps pacing around the room'
      );
      expect(result.isEmergency).toBe(true);
    });
  });

  describe('text normalization', () => {
    it('handles smart quotes', () => {
      const result = detectEmergencyKeywords('My dog won\u2019t wake up');
      expect(result.isEmergency).toBe(true);
    });

    it('is case insensitive', () => {
      const result = detectEmergencyKeywords('MY DOG IS HAVING A SEIZURE');
      expect(result.isEmergency).toBe(true);
    });

    it('handles extra whitespace', () => {
      const result = detectEmergencyKeywords('dog   is   choking   on   bone');
      expect(result.isEmergency).toBe(true);
    });
  });
});
