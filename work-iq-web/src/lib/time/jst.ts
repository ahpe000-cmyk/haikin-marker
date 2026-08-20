const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Returns the JST calendar date (YYYY-MM-DD) for the given moment. */
export function getJstDateKey(date: Date = new Date()): string {
  return new Date(date.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Adds whole days to a YYYY-MM-DD key without timezone drift. */
export function addDaysToDateKey(dateKey: string, days: number): string {
  const base = new Date(`${dateKey}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

/** Signed difference in days: a - b. */
export function diffDateKeys(a: string, b: string): number {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round(
    (Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / dayMs,
  );
}
