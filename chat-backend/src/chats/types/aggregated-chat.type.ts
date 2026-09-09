import { Types } from 'mongoose';
import { UserDocument } from '../../users/entities/user.document';
import { ChatType } from '../entities/chat-type.enum';
import { AggregatedLatestMessage } from './aggregated-latest-message.type';

export type AggregatedChat = {
  _id: Types.ObjectId;
  name?: string;
  type: ChatType;
  participantDocs?: UserDocument[];
  latestMessage?: AggregatedLatestMessage;
  unreadCount?: number;
};
