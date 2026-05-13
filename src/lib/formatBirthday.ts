// Birthday display formatter for the My Information screen.
// Converts an ISO date string ("1992-05-14") to a human-readable form
// ("May 14, 1992"). Returns "" for null/empty input.
//
// Timezone note: "1992-05-14" is a date-only string. Parsing it as
// `new Date("1992-05-14")` treats it as UTC midnight, which on a UTC-N
// machine shifts to the previous calendar day. To avoid the off-by-one,
// we parse the parts manually and construct the Date in local time.

export function formatBirthdayDisplay(iso: string | null | undefined): string {
  if (!iso) return '';
  const trimmed = iso.trim();
  if (!trimmed) return '';

  // Expect "YYYY-MM-DD"
  const parts = trimmed.split('-');
  if (parts.length !== 3) return '';

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-based for Date constructor
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return '';

  // Construct in local time to avoid UTC-offset day shift
  const date = new Date(year, month, day);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
