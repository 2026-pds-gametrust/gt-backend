import { Schema } from 'mongoose';
import { EUserStatus } from '../../../../domain/identity/entity/enums/EUserStatus';
import type { IMUser } from '../models/user.model';

export const UserSchema = new Schema<IMUser>(
  {
    id: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    phone: { type: String, required: true },
    cpf: { type: String, required: true, unique: true, index: true },
    birthDate: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
    phoneVerified: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      enum: Object.values(EUserStatus),
      required: true,
      default: EUserStatus.PENDING_VERIFICATION,
    },
    groups: {
      type: [String],
      required: false,
      default: [],
    },
  },
  { timestamps: true, collection: 'users' },
);
