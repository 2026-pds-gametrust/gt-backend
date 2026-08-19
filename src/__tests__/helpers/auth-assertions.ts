import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';

export function assertNoSecretFields(payload: unknown): void {
  const json = JSON.stringify(payload);
  expect(json).not.toMatch(/"password"\s*:/);
  expect(json).not.toMatch(/"passwordHash"\s*:/);
}

export function assertUnauthorized(response: {
  statusCode: number;
  body: { code?: string; error?: string; message?: string };
}): void {
  expect(response.statusCode).toBe(401);
  expect(response.body).toMatchObject({
    code: EErrorCode.AUTH_UNAUTHORIZED,
    error: ErrorCatalog[EErrorCode.AUTH_UNAUTHORIZED].en,
  });
}

export function birthDateYearsAgo(years: number, dayOffset = 0): string {
  const today = new Date();
  const year = today.getUTCFullYear() - years;
  const month = today.getUTCMonth();
  const day = today.getUTCDate() + dayOffset;
  const date = new Date(Date.UTC(year, month, day));
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
