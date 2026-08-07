import { Types } from 'mongoose';
import { TrustEventServiceFactory } from '../../../../configuration/factory/trust-event.service.factory';
import { ETrustEventType } from '../../../../domain/trust/entity/enums/ETrustEventType';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { validTrustEventMock } from '../../../__mocks__/trust.mock';

const trustEventService = TrustEventServiceFactory.create();

describe('when we append a trust event', () => {
  it('should persist the ledger entry', async () => {
    const event = validTrustEventMock({
      type: ETrustEventType.USER_VERIFIED,
      payload: { userId: 'u1' },
    });
    const created = await trustEventService.appendTrustEvent(event);
    expect(created.sourceEventId).toBe(event.sourceEventId);
    expect(created.type).toBe(ETrustEventType.USER_VERIFIED);
  });

  it('should return existing event for duplicate sourceEventId', async () => {
    const sourceEventId = `dup-${Date.now()}`;
    const first = await trustEventService.appendTrustEvent(
      validTrustEventMock({
        sourceEventId,
        type: ETrustEventType.USER_VERIFIED,
        payload: { userId: 'u1' },
      }),
    );
    const second = await trustEventService.appendTrustEvent(
      validTrustEventMock({
        id: new Types.ObjectId().toHexString(),
        sellerId: first.sellerId,
        sourceEventId,
        type: ETrustEventType.USER_VERIFIED,
        payload: { userId: 'u1' },
      }),
    );
    expect(second.id).toBe(first.id);
  });

  it('should reject PII payload keys', async () => {
    await expect(
      trustEventService.appendTrustEvent(
        validTrustEventMock({
          payload: { cpf: '123' },
        }),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});
