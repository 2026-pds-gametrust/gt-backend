import { Types, model } from 'mongoose';
import { IOutboxEntry } from '../../../../domain/common/messaging/outbox/outbox-entry.interface';
import { OutboxSchema } from '../schema/outbox.schema';

export interface IMOutbox extends Omit<IOutboxEntry, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const OutboxModel = model<IMOutbox>('Outbox', OutboxSchema);
