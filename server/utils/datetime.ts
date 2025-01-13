/**
 * Constants representing common time durations in seconds.
 * These can be used to easily calculate and work with time-based values.
 */
export const DURATION = {
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
  MONTH: 30 * 24 * 60 * 60,
} as const

/**
 * Converts a timestamp to an ISO string.
 * @param timestamp - The timestamp to convert, as a number, null, or undefined.
 * @returns The ISO string representation of the timestamp, or null if the input was null or undefined.
 */
export function toISOString(timestamp: number | null | undefined): string | null {
  if (!timestamp) return null
  return new Date(timestamp * 1000).toISOString()
}

/**
 * Returns the current UTC timestamp as an ISO string.
 * Used for database timestamps (e.g., created_at, updated_at).
 * @returns {string} The current UTC timestamp as an ISO string.
 */
export function getUtcTimestamp(): string {
  return new Date().toISOString()
}
