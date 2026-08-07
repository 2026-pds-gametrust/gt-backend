import { EListingStatus } from '../enums/EListingStatus';

export interface IListingEvent {
  id: string;
  listingId: string;
  fromStatus: EListingStatus | null;
  toStatus: EListingStatus;
  reason?: string;
  actorId?: string;
  occurredAt: Date;
}
