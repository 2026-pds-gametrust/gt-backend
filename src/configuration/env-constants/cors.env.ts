const DEFAULT_LOCAL_ORIGINS = ['http://localhost:5173'];

function parseOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return DEFAULT_LOCAL_ORIGINS;
  }
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/** Comma-separated list; defaults to the Vite local origin. */
export const CORS_ALLOWED_ORIGINS = parseOrigins(
  process.env.CORS_ALLOWED_ORIGINS,
);
