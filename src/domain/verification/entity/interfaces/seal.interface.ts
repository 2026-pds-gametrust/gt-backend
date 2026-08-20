import { ESealStatus } from '../enums/ESealStatus';
import { ESealType } from '../enums/ESealType';

export interface ISeal {
  id: string;
  listingId: string;
  caseId: string;
  type: ESealType;
  status: ESealStatus;
  grantedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
