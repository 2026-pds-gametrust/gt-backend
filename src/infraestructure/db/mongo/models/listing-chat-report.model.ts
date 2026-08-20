import { Types, model } from 'mongoose';
import { IChatReport } from '../../../../domain/listing-chat/entity/interfaces/chat-report.interface';
import { ListingChatReportSchema } from '../schema/listing-chat-report.schema';

export interface IMChatReport extends Omit<IChatReport, 'updatedAt'> {
  _id: Types.ObjectId;
  updatedAt?: Date;
}

export const ListingChatReportModel = model<IMChatReport>(
  'ListingChatReport',
  ListingChatReportSchema,
);
