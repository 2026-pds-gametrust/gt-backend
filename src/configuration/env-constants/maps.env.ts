const DEFAULT_BRASIL_API_BASE = 'https://brasilapi.com.br/api';
const DEFAULT_NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_USER_AGENT = 'GamerTrustBackend/1.0 (maps@gamertrust.local)';

export const BRASIL_API_BASE_URL = (
  process.env.BRASIL_API_BASE_URL || DEFAULT_BRASIL_API_BASE
).replace(/\/$/, '');

export const NOMINATIM_BASE_URL = (
  process.env.NOMINATIM_BASE_URL || DEFAULT_NOMINATIM_BASE
).replace(/\/$/, '');

export const MAPS_HTTP_TIMEOUT_MS = Number(
  process.env.MAPS_HTTP_TIMEOUT_MS || DEFAULT_TIMEOUT_MS,
);

export const NOMINATIM_USER_AGENT =
  process.env.NOMINATIM_USER_AGENT || DEFAULT_USER_AGENT;

export const GEO_NEAR_MAX_RADIUS_METERS = Number(
  process.env.GEO_NEAR_MAX_RADIUS_METERS || 50_000,
);

export const GEO_NEAR_DEFAULT_LIMIT = Number(
  process.env.GEO_NEAR_DEFAULT_LIMIT || 20,
);

export const GEO_NEAR_MAX_LIMIT = Number(
  process.env.GEO_NEAR_MAX_LIMIT || 50,
);
