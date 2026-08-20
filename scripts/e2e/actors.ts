/**
 * Real actors for the E2E suite. Every token comes from a real POST /auth/register
 * or /auth/login — never from a hand-signed JWT — so the whole auth pipeline is
 * exercised. Auth routes are rate limited (20 req / 15 min), so callers must
 * bootstrap actors once per run and reuse the tokens.
 */
import { post, put } from './client';

export interface IActor {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

interface IAuthSession {
  user: { id: string };
  accessToken: string;
  refreshToken: string;
}

export const PASSWORD = 'E2ePass!2026';

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin.e2e@gamertrust.local';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'E2eAdmin!2026';

function cpfWithCheckDigits(base: string): string {
  const digits = base.padStart(9, '0').slice(0, 9).split('').map(Number);
  const dv = (source: number[], startWeight: number): number => {
    const total = source.reduce(
      (sum, digit, index) => sum + digit * (startWeight - index),
      0,
    );
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  const d1 = dv(digits, 10);
  const d2 = dv([...digits, d1], 11);
  return [...digits, d1, d2].join('');
}

let cpfCounter = 0;
export function uniqueCpf(): string {
  cpfCounter += 1;
  const stamp = `${Date.now()}${cpfCounter}`.slice(-9);
  return cpfWithCheckDigits(stamp);
}

export function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function birthDateYearsAgo(years: number): string {
  const now = new Date();
  return new Date(now.getFullYear() - years, now.getMonth(), now.getDate())
    .toISOString()
    .slice(0, 10);
}

/** Registers a brand new APP_USER and returns its real session. */
export async function registerActor(label: string): Promise<IActor> {
  const id = uniqueId(label);
  const email = `${id}@e2e.local`;
  const { status, body } = await post<IAuthSession>('/auth/register', {
    body: {
      id,
      fullName: `E2E ${label}`,
      email,
      phone: '11999990000',
      cpf: uniqueCpf(),
      birthDate: birthDateYearsAgo(30),
      password: PASSWORD,
    },
  });
  if (status !== 201) {
    throw new Error(
      `registerActor(${label}) expected 201, got ${status}: ${JSON.stringify(body)}`,
    );
  }
  return {
    userId: body.user.id,
    email,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
  };
}

/** Logs in the seeded ADMIN (created by `yarn seed:local`). */
export async function loginAdmin(): Promise<IActor> {
  const { status, body } = await post<IAuthSession>('/auth/login', {
    body: { email: SEED_ADMIN_EMAIL, password: SEED_ADMIN_PASSWORD },
  });
  if (status !== 200) {
    throw new Error(
      `loginAdmin expected 200, got ${status}: ${JSON.stringify(body)} — run "yarn seed:local" first`,
    );
  }
  return {
    userId: body.user.id,
    email: SEED_ADMIN_EMAIL,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
  };
}

/** Promotes an actor to the given groups. Requires an ADMIN token. */
export async function grantGroups(
  admin: IActor,
  target: IActor,
  groups: string[],
): Promise<void> {
  const { status, body } = await put(`/users/${target.userId}/groups`, {
    token: admin.accessToken,
    body: { groups },
  });
  if (status !== 200) {
    throw new Error(
      `grantGroups(${groups.join(',')}) expected 200, got ${status}: ${JSON.stringify(body)}`,
    );
  }
}

/** Re-logs in so the access token carries the freshly granted groups. */
export async function reloginActor(actor: IActor): Promise<IActor> {
  const { status, body } = await post<IAuthSession>('/auth/login', {
    body: { email: actor.email, password: PASSWORD },
  });
  if (status !== 200) {
    throw new Error(`reloginActor expected 200, got ${status}: ${JSON.stringify(body)}`);
  }
  return { ...actor, accessToken: body.accessToken, refreshToken: body.refreshToken };
}
