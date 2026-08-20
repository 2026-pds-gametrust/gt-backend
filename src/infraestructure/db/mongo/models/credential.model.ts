import { model } from 'mongoose';
import { IMCredential } from '../interfaces/credential.interface';
import { CredentialSchema } from '../schema/credential.schema';

export type { IMCredential };

export const CredentialModel = model<IMCredential>(
  'Credential',
  CredentialSchema,
);
