import { Types } from 'mongoose';
import { ListingEventServiceEntity } from '../../../../domain/listings/entity/listing-event.entity';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { IListingEvent } from '../../../../domain/listings/entity/interfaces/listing-event.interface';

const validListingEvent = (
  override?: Partial<IListingEvent>,
): IListingEvent => ({
  id: new Types.ObjectId().toHexString(),
  listingId: new Types.ObjectId().toHexString(),
  fromStatus: EListingStatus.DRAFT,
  toStatus: EListingStatus.SUBMITTED,
  reason: 'submit',
  actorId: 'actor-1',
  occurredAt: new Date(),
  ...override,
});

describe('when constructing a listing event entity', () => {
  it('should accept a valid listing event', () => {
    const entity = new ListingEventServiceEntity(validListingEvent());
    expect(entity.toStatus).toBe(EListingStatus.SUBMITTED);
    expect(entity.fromStatus).toBe(EListingStatus.DRAFT);
  });

  it('should default fromStatus to null when omitted', () => {
    const entity = new ListingEventServiceEntity(
      validListingEvent({ fromStatus: undefined }),
    );
    expect(entity.fromStatus).toBeNull();
  });

  it('should reject missing id', () => {
    expect(
      () => new ListingEventServiceEntity(validListingEvent({ id: '  ' })),
    ).toThrow('id is required');
  });

  it('should reject missing listingId', () => {
    expect(
      () =>
        new ListingEventServiceEntity(validListingEvent({ listingId: '' })),
    ).toThrow('listingId is required');
  });

  it('should reject missing toStatus', () => {
    expect(
      () =>
        new ListingEventServiceEntity(
          validListingEvent({ toStatus: undefined as any }),
        ),
    ).toThrow('toStatus is required');
  });
});
