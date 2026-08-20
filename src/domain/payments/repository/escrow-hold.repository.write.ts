import { IEscrowHold } from '../entity/interfaces/escrow-hold.interface';
import { IOutboxSession } from '../../common/messaging/outbox/outbox.repository.write';

export interface IEscrowHoldRepositoryWrite {
  createEscrowHold(
    escrowHold: IEscrowHold,
    session?: IOutboxSession,
  ): Promise<IEscrowHold>;
}

export interface IEscrowHoldRepositoryRead {
  findByOrderId(orderId: string): Promise<IEscrowHold | null>;
}
