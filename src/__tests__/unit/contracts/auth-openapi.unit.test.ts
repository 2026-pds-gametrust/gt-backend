import fs from 'fs';
import path from 'path';

const yaml = fs.readFileSync(
  path.join(__dirname, '../../../contracts/service.yaml'),
  'utf8',
);

function schemaBlock(name: string): string {
  const start = yaml.indexOf(`    ${name}:`);
  expect(start).toBeGreaterThan(-1);
  const rest = yaml.slice(start);
  const next = rest.search(/\n {4}[A-Z][A-Za-z0-9]+:/);
  return next === -1 ? rest : rest.slice(0, next);
}

describe('when inspecting the published OpenAPI auth contract', () => {
  it('should declare bearerAuth as HTTP bearer JWT', () => {
    expect(yaml).toContain('bearerAuth:');
    expect(yaml).toMatch(/bearerAuth:[\s\S]*type: http/);
    expect(yaml).toMatch(/bearerAuth:[\s\S]*scheme: bearer/);
    expect(yaml).toMatch(/bearerAuth:[\s\S]*bearerFormat: JWT/);
    expect(yaml).toContain('  - bearerAuth: []');
    expect(yaml).toContain('- name: Auth');
  });
});

describe('when inspecting public auth and discovery operations', () => {
  it('should mark register login refresh catalog GETs listings and search as security []', () => {
    expect(yaml).toMatch(/\/auth\/register:[\s\S]*?security: \[\]/);
    expect(yaml).toMatch(/\/auth\/login:[\s\S]*?security: \[\]/);
    expect(yaml).toMatch(/\/auth\/refresh:[\s\S]*?security: \[\]/);
    expect(yaml).toMatch(/\/categories:[\s\S]*?security: \[\]/);
    expect(yaml).toMatch(/\/listings:[\s\S]*?security: \[\]/);
    expect(yaml).toMatch(/\/listings\/\{id\}:[\s\S]*?security: \[\]/);
    expect(yaml).toMatch(/\/search:[\s\S]*?security: \[\]/);
    expect(yaml).toMatch(/\/products:[\s\S]*?security: \[\]/);
    expect(yaml).toMatch(/\/services:[\s\S]*?security: \[\]/);
    expect(yaml).toMatch(/\/media\/uploads:[\s\S]*?security: \[\]/);
    expect(yaml).toMatch(/\/media\/assets\/\{id\}:[\s\S]*?security: \[\]/);
  });
});

describe('when inspecting auth error documentation', () => {
  it('should document AUTH_INVALID_CREDENTIALS and AUTH_UNAUTHORIZED separately from 403', () => {
    expect(yaml).toContain('AUTH_INVALID_CREDENTIALS');
    expect(yaml).toContain('AUTH_UNAUTHORIZED');
    expect(yaml).toContain("'Access denied'");
    expect(yaml).toContain("description: Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED");
  });

  it('should document 429 on register login and refresh and omit 409 on register', () => {
    expect(yaml).toMatch(/\/auth\/register:[\s\S]*?'429':/);
    expect(yaml).toMatch(/\/auth\/login:[\s\S]*?'429':/);
    expect(yaml).toMatch(/\/auth\/refresh:[\s\S]*?'429':/);
    expect(yaml).not.toMatch(
      /\/auth\/register:[\s\S]*?'409':[\s\S]*?\/auth\/login:/,
    );
    expect(yaml).toContain('AuthThrottled:');
  });
});

describe('when inspecting User AuthSession NewUser and UpdateUser schemas', () => {
  it('should omit password fields and keep NewAuthRegistration distinct from NewUser', () => {
    for (const name of ['User', 'AuthSession', 'NewUser', 'UpdateUser']) {
      const block = schemaBlock(name);
      expect(block).not.toMatch(/^\s+password:/m);
      expect(block).not.toMatch(/passwordHash/);
    }
    const registration = schemaBlock('NewAuthRegistration');
    expect(registration).toMatch(/password:/);
    const newUser = schemaBlock('NewUser');
    expect(newUser).not.toMatch(/password:/);
    expect(yaml).toContain('/users/{id}/groups:');
    expect(yaml).toContain('Assign user groups (ADMIN only)');
  });
});
