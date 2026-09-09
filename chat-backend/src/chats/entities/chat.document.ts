import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity';
import { ChatType } from './chat-type.enum';

@Schema({ versionKey: false })
export class ChatDocument extends AbstractEntity {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  creatorId: Types.ObjectId;

  @Prop()
  name?: string;

  @Prop({ type: String, enum: ChatType, required: true })
  type: ChatType;

  @Prop({ type: [SchemaTypes.ObjectId], required: true })
  participantIds: Types.ObjectId[];

  @Prop({ type: String, sparse: true, unique: true })
  dmKey?: string;

  /** Per-user read cursor: userId hex → last time they opened/read the chat. */
  @Prop({ type: Map, of: Date, default: {} })
  lastReadAtByUser?: Map<string, Date>;
}

export const ChatSchema = SchemaFactory.createForClass(ChatDocument);

ChatSchema.index({ participantIds: 1 });
