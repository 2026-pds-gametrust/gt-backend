import { assertProofCodePepperConfigured } from '../env-constants/proof-code.env';
import { HmacPossessionProofCodeIssuer } from '../../infraestructure/crypto/hmac-possession-proof-code-issuer';

export class PossessionProofCodeIssuerFactory {
  static create() {
    return new HmacPossessionProofCodeIssuer(assertProofCodePepperConfigured());
  }
}
