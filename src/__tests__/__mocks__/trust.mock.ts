import { Types } from 'mongoose';
import { ETrustEventType } from '../../domain/trust/entity/enums/ETrustEventType';
import { ITrustEvent } from '../../domain/trust/entity/interfaces/trust-event.interface';
import { ESellerLevel } from '../../domain/trust/entity/enums/ESellerLevel';
import { ISellerLevel } from '../../domain/trust/entity/interfaces/seller-level.interface';
import { ITrustScore } from '../../domain/trust/entity/interfaces/trust-score.interface';

export const validTrustEventMock = (
  override?: Partial<ITrustEvent>,
): ITrustEvent => ({
  id: new Types.ObjectId().toHexString(),
  sellerId: new Types.ObjectId().toHexString(),
  type: ETrustEventType.SEAL_GRANTED,
  sourceEventId: `src-${Date.now()}-${Math.random()}`,
  payload: { sealId: new Types.ObjectId().toHexString() },
  occurredAt: new Date(),
  createdAt: new Date(),
  ...override,
});

export const validTrustScoreMock = (
  override?: Partial<ITrustScore>,
): ITrustScore => ({
  id: new Types.ObjectId().toHexString(),
  sellerId: new Types.ObjectId().toHexString(),
  score: 0,
  components: {},
  computedAt: new Date(),
  ...override,
});

export const validSellerLevelMock = (
  override?: Partial<ISellerLevel>,
): ISellerLevel => ({
  id: new Types.ObjectId().toHexString(),
  sellerId: new Types.ObjectId().toHexString(),
  level: ESellerLevel.NEW,
  updatedAt: new Date(),
  ...override,
});
