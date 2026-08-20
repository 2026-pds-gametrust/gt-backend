import { NODE_ENV } from './env.constants';

const TEST_PROOF_CODE_PEPPER = 'gt-test-proof-code-pepper-min-32-chars!!';

export const PROOF_CODE_PEPPER =
  process.env.PROOF_CODE_PEPPER ||
  (NODE_ENV === 'test' ? TEST_PROOF_CODE_PEPPER : '');

export function assertProofCodePepperConfigured(): string {
  const pepper = PROOF_CODE_PEPPER;
  if (!pepper || (NODE_ENV !== 'test' && pepper.length < 32)) {
    throw new Error('PROOF_CODE_PEPPER must be set (min 32 chars)');
  }
  return pepper;
}
