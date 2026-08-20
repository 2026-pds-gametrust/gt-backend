/** Escapes user input before embedding in a MongoDB $regex filter (ReDoS-safe literal). */
export function escapeRegexLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
