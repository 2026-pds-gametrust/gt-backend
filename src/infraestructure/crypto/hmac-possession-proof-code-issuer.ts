import { createHash, createHmac } from 'crypto';
import {
  IIssuedPossessionProofCode,
  IPossessionProofCodeIssuer,
} from '../../domain/verification/ports/possession-proof-code-issuer.interface';

/** Crockford-like alphabet without ambiguous glyphs 0/O/1/I/L. */
const PROOF_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
const PROOF_CODE_LENGTH = 8;

export class HmacPossessionProofCodeIssuer
  implements IPossessionProofCodeIssuer
{
  constructor(private readonly pepper: string) {}

  issueForCase(caseId: string): IIssuedPossessionProofCode {
    const digest = createHmac('sha256', this.pepper).update(caseId).digest();
    let code = '';
    for (let i = 0; i < PROOF_CODE_LENGTH; i += 1) {
      code += PROOF_CODE_ALPHABET[digest[i] % PROOF_CODE_ALPHABET.length];
    }
    const hash = createHash('sha256').update(code, 'utf8').digest('hex');
    return { code, hash };
  }
}
