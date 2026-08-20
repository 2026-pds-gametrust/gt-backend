import { createHash } from 'crypto';
import { HmacPossessionProofCodeIssuer } from '../../../../infraestructure/crypto/hmac-possession-proof-code-issuer';

const PEPPER = 'gt-test-proof-code-pepper-min-32-chars!!';

describe('when issuing a possession proof code', () => {
  it('should return deterministic 8-char Crockford-like code and SHA-256 hash', () => {
    const issuer = new HmacPossessionProofCodeIssuer(PEPPER);
    const caseId = 'case-abc-123';

    const first = issuer.issueForCase(caseId);
    const second = issuer.issueForCase(caseId);

    expect(first.code).toHaveLength(8);
    expect(first.code).toMatch(/^[23456789ABCDEFGHJKMNPQRSTVWXYZ]+$/);
    expect(first.code).toBe(second.code);
    expect(first.hash).toBe(
      createHash('sha256').update(first.code, 'utf8').digest('hex'),
    );
  });
});

describe('when issuing for different case ids', () => {
  it('should return different codes', () => {
    const issuer = new HmacPossessionProofCodeIssuer(PEPPER);
    const a = issuer.issueForCase('case-a');
    const b = issuer.issueForCase('case-b');
    expect(a.code).not.toBe(b.code);
  });
});
