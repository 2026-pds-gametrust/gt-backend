/**
 * Thin HTTP client for the E2E suite. Logs every request/response as NDJSON so a
 * failing step can be inspected without re-running the funnel.
 */
import { appendFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const LOG_PATH = process.env.E2E_LOG || 'docs/qa/e2e-phase1/_evidence/requests.ndjson';

export interface IE2EResponse<T = unknown> {
  status: number;
  body: T;
}

function log(entry: Record<string, unknown>): void {
  try {
    mkdirSync(dirname(LOG_PATH), { recursive: true });
    appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`);
  } catch {
    // evidence logging must never break a run
  }
}

export async function request<T = unknown>(
  method: string,
  path: string,
  options: { token?: string; body?: unknown; headers?: Record<string, string> } = {},
): Promise<IE2EResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const raw = await response.text();
  let body: unknown = raw;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    // non-JSON response (e.g. 204) stays raw
  }

  log({
    at: new Date().toISOString(),
    method,
    path,
    status: response.status,
    authenticated: Boolean(options.token),
    body,
  });

  return { status: response.status, body: body as T };
}

export const post = <T = unknown>(p: string, o?: Parameters<typeof request>[2]) =>
  request<T>('POST', p, o);
export const put = <T = unknown>(p: string, o?: Parameters<typeof request>[2]) =>
  request<T>('PUT', p, o);
export const get = <T = unknown>(p: string, o?: Parameters<typeof request>[2]) =>
  request<T>('GET', p, o);
export const del = <T = unknown>(p: string, o?: Parameters<typeof request>[2]) =>
  request<T>('DELETE', p, o);
