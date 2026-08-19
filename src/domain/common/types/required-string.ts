export function isBlank(
  value: string | undefined | null,
): value is undefined | null | '' {
  return !value?.trim();
}

export function requireNonEmptyString(
  value: string | undefined | null,
  fieldLabel: string,
): asserts value is string {
  if (isBlank(value)) {
    throw new Error(`${fieldLabel} is required`);
  }
}

export function requireNonEmptyWhenProvided(
  value: string | undefined | null,
  fieldLabel: string,
): void {
  if (value !== undefined && isBlank(value)) {
    throw new Error(`${fieldLabel} must be non-empty when provided`);
  }
}
