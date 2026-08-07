/** Normalize taxonomy synonyms for uniqueness checks and search projection (DEC-024). */
export function normalizeSynonym(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
