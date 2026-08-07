import { EListingStatus } from './enums/EListingStatus';
import { IListingEvent } from './interfaces/listing-event.interface';

export class ListingEventServiceEntity implements IListingEvent {
  id: string;
  listingId: string;
  fromStatus: EListingStatus | null;
  toStatus: EListingStatus;
  reason?: string;
  actorId?: string;
  occurredAt: Date;

  constructor(event: IListingEvent) {
    this.validate(event);
    this.id = event.id;
    this.listingId = event.listingId;
    this.fromStatus = event.fromStatus ?? null;
    this.toStatus = event.toStatus;
    this.reason = event.reason?.trim();
    this.actorId = event.actorId?.trim();
    this.occurredAt = event.occurredAt || new Date();
  }

  private validate(event: IListingEvent): void {
    if (!event.id?.trim()) {
      throw new Error('id is required');
    }
    if (!event.listingId?.trim()) {
      throw new Error('listingId is required');
    }
    if (!event.toStatus) {
      throw new Error('toStatus is required');
    }
  }
}
