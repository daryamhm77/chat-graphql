import { Types } from 'mongoose';
import { UserDocument } from '../../users/entities/user.document';

export type AggregatedLatestMessage = {
  _id: Types.ObjectId;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentMimeType?: string;
  createdAt: Date;
  userDocs?: UserDocument[];
};
