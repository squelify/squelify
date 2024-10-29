/**
 * Convert unix timestamp to ISO string date
 */
export function toISOString(timestamp: number | null | undefined): string | null {
  if (!timestamp) return null
  return new Date(timestamp * 1000).toISOString()
}
