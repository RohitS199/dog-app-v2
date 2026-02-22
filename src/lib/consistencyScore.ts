// Pure function: computes consistency score from trailing 7-day check-in window
// Returns null if fewer than MIN_HISTORY_DAYS (5) days of data

import type { DailyCheckIn, MetricField } from '../types/checkIn';
import { METRIC_FIELDS } from '../types/checkIn';
import type { ConsistencyScore } from '../types/health';
import { CHECK_IN } from '../constants/config';

/**
 * Computes the mode (most frequent value) for a given metric across check-ins.
 * Ties are broken by the most recent check-in's value (check-ins should be
 * sorted by check_in_date descending before calling).
 */
function computeMode(checkIns: DailyCheckIn[], field: MetricField): string {
  const counts = new Map<string, number>();

  for (const checkIn of checkIns) {
    const value = checkIn[field];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let maxCount = 0;
  let mode = checkIns[0][field]; // default to most recent

  for (const [value, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      mode = value;
    }
  }

  return mode;
}

/**
 * Computes a consistency score (1-5) from a trailing window of check-ins.
 *
 * @param checkIns - Array of check-ins sorted by check_in_date descending (most recent first).
 *                   Should be the trailing 7 days.
 * @returns ConsistencyScore or null if insufficient data (<5 days)
 */
export function calculateConsistencyScore(
  checkIns: DailyCheckIn[],
): ConsistencyScore | null {
  if (checkIns.length < CHECK_IN.MIN_HISTORY_DAYS) {
    return null;
  }

  let matchCount = 0;

  for (const field of METRIC_FIELDS) {
    const mode = computeMode(checkIns, field);
    // Check if today's (most recent) value matches the mode
    if (checkIns[0][field] === mode) {
      matchCount++;
    }
  }

  // Map 0-7 matches to 1-5 scale
  // 0-1 matches = 1, 2-3 = 2, 4 = 3, 5-6 = 4, 7 = 5
  let score: number;
  if (matchCount <= 1) {
    score = 1;
  } else if (matchCount <= 3) {
    score = 2;
  } else if (matchCount === 4) {
    score = 3;
  } else if (matchCount <= 6) {
    score = 4;
  } else {
    score = 5;
  }

  return {
    score,
    matchCount,
    totalFields: METRIC_FIELDS.length,
  };
}
