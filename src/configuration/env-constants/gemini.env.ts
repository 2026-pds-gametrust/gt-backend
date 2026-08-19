export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
export const GEMINI_ANALYSIS_MODEL =
  process.env.GEMINI_ANALYSIS_MODEL ?? 'gemini-3.6-flash';
export const GEMINI_ANALYSIS_ENABLED =
  process.env.GEMINI_ANALYSIS_ENABLED === 'true';
export const GEMINI_ANALYSIS_TIMEOUT_MS = Number(
  process.env.GEMINI_ANALYSIS_TIMEOUT_MS ?? 90_000,
);
export const GEMINI_ANALYSIS_MAX_PHOTOS = Number(
  process.env.GEMINI_ANALYSIS_MAX_PHOTOS ?? 4,
);
export const GEMINI_ANALYSIS_MAX_VIDEO_BYTES = Number(
  process.env.GEMINI_ANALYSIS_MAX_VIDEO_BYTES ?? 10 * 1024 * 1024,
);
