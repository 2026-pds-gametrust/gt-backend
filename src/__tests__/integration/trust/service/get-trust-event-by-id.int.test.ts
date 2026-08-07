import { TrustEventServiceFactory } from '../../../../configuration/factory/trust-event.service.factory';
import { ETrustEventType } from '../../../../domain/trust/entity/enums/ETrustEventType';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { validTrustEventMock } from '../../../__mocks__/trust.mock';

const trustEventService = TrustEventServiceFactory.create();

describe('when we get a trust event by id', () => {
  it('should return the event when it exists', async () => {
    const created = await trustEventService.appendTrustEvent(
      validTrustEventMock({
        type: ETrustEventType.USER_VERIFIED,
        payload: { userId: 'u1' },
      }),
    );

    const found = await trustEventService.getTrustEventById(created.id);

    expect(found.id).toBe(created.id);
    expect(found.type).toBe(ETrustEventType.USER_VERIFIED);
  });

  it('should reject with RESOURCE_NOT_FOUND when missing', async () => {
    await expect(
      trustEventService.getTrustEventById('missing-trust-event'),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
