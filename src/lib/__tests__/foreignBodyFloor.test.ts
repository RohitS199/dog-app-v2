/**
 * Unit tests for the Step 12b foreign body urgency floor regex.
 *
 * This regex lives server-side in check-symptoms v10 (index.ts Step 12b),
 * but we test the pattern here to catch regressions without a live deploy.
 * The pattern forces urgency to "urgent" minimum when foreign body ingestion
 * is detected in the symptom text.
 */

// Exact replica of the Step 12b regex from check-symptoms v10 index.ts
const FOREIGN_BODY_PATTERN =
  /\b(?:ate|swallowed|ingested|eaten|chewed\s+up|got\s+into).{0,40}\b(?:sock|toy|bone|rock|ball|string|needle|battery|coin|fabric|plastic|rubber|corn\s+cob|rawhide|underwear|cloth|wood|magnet|ribbon|tinsel|thread|hair\s+tie|stuffing|glove|diaper)\b/i;

type UrgencyLevel = 'emergency' | 'urgent' | 'soon' | 'monitor';

/**
 * Simulates the Step 12b logic from check-symptoms v10:
 * If foreign body pattern matches and urgency is monitor/soon, floor to urgent.
 */
function applyForeignBodyFloor(
  symptoms: string,
  urgency: UrgencyLevel
): { urgency: UrgencyLevel; wasFloored: boolean } {
  if (FOREIGN_BODY_PATTERN.test(symptoms)) {
    if (urgency === 'monitor' || urgency === 'soon') {
      return { urgency: 'urgent', wasFloored: true };
    }
  }
  return { urgency, wasFloored: false };
}

describe('Step 12b: Foreign Body Urgency Floor', () => {
  describe('floor logic', () => {
    const sockPrompt = 'My puppy ate a sock yesterday';

    it('floors "monitor" to "urgent" when foreign body detected', () => {
      const result = applyForeignBodyFloor(sockPrompt, 'monitor');
      expect(result.urgency).toBe('urgent');
      expect(result.wasFloored).toBe(true);
    });

    it('floors "soon" to "urgent" when foreign body detected', () => {
      const result = applyForeignBodyFloor(sockPrompt, 'soon');
      expect(result.urgency).toBe('urgent');
      expect(result.wasFloored).toBe(true);
    });

    it('does not change "urgent" (already at floor)', () => {
      const result = applyForeignBodyFloor(sockPrompt, 'urgent');
      expect(result.urgency).toBe('urgent');
      expect(result.wasFloored).toBe(false);
    });

    it('does not change "emergency" (above floor)', () => {
      const result = applyForeignBodyFloor(sockPrompt, 'emergency');
      expect(result.urgency).toBe('emergency');
      expect(result.wasFloored).toBe(false);
    });
  });

  describe('pattern matching — common foreign bodies', () => {
    const cases: [string, boolean][] = [
      ['My puppy ate a sock yesterday', true],
      ['Dog swallowed a toy ball whole', true],
      ['She ate a chicken bone from the trash', true],
      ['He swallowed a coin off the table', true],
      ['My dog ate some plastic wrapping', true],
      ['She chewed up a rubber toy and swallowed pieces', true],
      ['He got into a battery that fell on the floor', true],
      ['My dog swallowed a needle from the sewing kit', true],
      ['Dog ate some ribbon from the gift wrap', true],
      ['She swallowed a hair tie', true],
      ['My puppy ingested some stuffing from his bed', true],
      ['He ate a corn cob at the barbecue', true],
    ];

    it.each(cases)('"%s" → match=%s', (input, expected) => {
      expect(FOREIGN_BODY_PATTERN.test(input)).toBe(expected);
    });
  });

  describe('negative cases — should NOT trigger floor', () => {
    it('does not match regular symptoms without ingestion', () => {
      const result = applyForeignBodyFloor(
        'My dog is limping and seems tired',
        'monitor'
      );
      expect(result.wasFloored).toBe(false);
    });

    it('does not match food items (not foreign bodies)', () => {
      expect(FOREIGN_BODY_PATTERN.test('My dog ate some chicken')).toBe(false);
      expect(FOREIGN_BODY_PATTERN.test('She ate too much kibble')).toBe(false);
      expect(FOREIGN_BODY_PATTERN.test('He ate grass in the yard')).toBe(false);
    });

    it('does not match "ate" without a foreign body object', () => {
      expect(FOREIGN_BODY_PATTERN.test('My dog ate his dinner too fast')).toBe(
        false
      );
    });

    it('does not match when gap between verb and object exceeds 40 chars', () => {
      // 41+ chars between "ate" and "sock" should NOT match
      const longGap =
        'My dog ate something really weird looking and unusual and it was a sock';
      // "ate" to "sock" gap is >40 chars
      expect(FOREIGN_BODY_PATTERN.test(longGap)).toBe(false);
    });
  });

  describe('known edge cases (limitations)', () => {
    it('does NOT catch "got ahold of" phrasing (known regex limitation)', () => {
      // This phrasing relies on the LLM system prompt rule, not the regex
      expect(
        FOREIGN_BODY_PATTERN.test('My dog got ahold of a sock')
      ).toBe(false);
    });

    it('does NOT catch "found my sock half-chewed" (passive phrasing)', () => {
      // Passive phrasing without an ingestion verb — relies on system prompt
      expect(
        FOREIGN_BODY_PATTERN.test('I found my sock half-chewed on the floor')
      ).toBe(false);
    });
  });
});
