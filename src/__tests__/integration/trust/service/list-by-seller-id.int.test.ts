import { TrustEventServiceFactory } from '../../../../configuration/factory/trust-event.service.factory';
import { ETrustEventType } from '../../../../domain/trust/entity/enums/ETrustEventType';
import { validTrustEventMock } from '../../../__mocks__/trust.mock';

const trustEventService = TrustEventServiceFactory.create();

describe('when we list trust events by seller id', () => {
  it('should return only events for that seller', async () => {
    const sellerId = `seller-list-${Date.now()}`;
    await trustEventService.appendTrustEvent(
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.USER_VERIFIED,
        payload: { userId: sellerId },
      }),
    );
    await trustEventService.appendTrustEvent(
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.ORDER_COMPLETED,
        payload: { orderId: 'o1' },
      }),
    );
    await trustEventService.appendTrustEvent(
      validTrustEventMock({
        type: ETrustEventType.SEAL_GRANTED,
        payload: { sealId: 'other' },
      }),
    );

    const events = await trustEventService.listBySellerId(sellerId);

    expect(events.length).toBe(2);
    expect(events.every((event) => event.sellerId === sellerId)).toBe(true);
  });

  it('should return an empty list when seller has no events', async () => {
    const events = await trustEventService.listBySellerId(
      `missing-seller-${Date.now()}`,
    );
    expect(events).toEqual([]);
  });
});
