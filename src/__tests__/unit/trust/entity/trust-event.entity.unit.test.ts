import { TrustEventServiceEntity } from '../../../../domain/trust/entity/trust-event.entity';
import { ETrustEventType } from '../../../../domain/trust/entity/enums/ETrustEventType';
import { validTrustEventMock } from '../../../__mocks__/trust.mock';

describe('when constructing a trust event entity', () => {
  it('should accept a valid trust event and trim fields', () => {
    const entity = new TrustEventServiceEntity(
      validTrustEventMock({
        sellerId: '  seller-1  ',
        sourceEventId: '  src-1  ',
        type: ETrustEventType.USER_VERIFIED,
        payload: { userId: 'seller-1' },
      }),
    );
    expect(entity.sellerId).toBe('seller-1');
    expect(entity.sourceEventId).toBe('src-1');
    expect(entity.type).toBe(ETrustEventType.USER_VERIFIED);
  });

  it('should reject missing id', () => {
    expect(
      () => new TrustEventServiceEntity(validTrustEventMock({ id: ' ' })),
    ).toThrow('id is required');
  });

  it('should reject missing sellerId', () => {
    expect(
      () =>
        new TrustEventServiceEntity(validTrustEventMock({ sellerId: '' })),
    ).toThrow('sellerId is required');
  });

  it('should reject missing type', () => {
    expect(
      () =>
        new TrustEventServiceEntity(
          validTrustEventMock({ type: undefined as any }),
        ),
    ).toThrow('type is required');
  });

  it('should reject missing sourceEventId', () => {
    expect(
      () =>
        new TrustEventServiceEntity(
          validTrustEventMock({ sourceEventId: ' ' }),
        ),
    ).toThrow('sourceEventId is required');
  });

  it('should reject missing payload', () => {
    expect(
      () =>
        new TrustEventServiceEntity(
          validTrustEventMock({ payload: undefined as any }),
        ),
    ).toThrow('payload is required');
  });
});
