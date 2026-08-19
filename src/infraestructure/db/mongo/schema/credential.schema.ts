import { Schema } from 'mongoose';
import type { IMCredential } from '../interfaces/credential.interface';

export const CredentialSchema = new Schema<IMCredential>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true, collection: 'credentials' },
);
