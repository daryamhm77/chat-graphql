import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractEntity } from '../../../common/database/abstract.entity';

@Schema({ versionKey: false })
export class MessageDocument extends AbstractEntity {
  @Prop({ type: SchemaTypes.ObjectId, required: true, index: true })
  chatId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, default: '' })
  content: string;

  @Prop({ type: String, required: false })
  attachmentUrl?: string;

  @Prop({ type: String, required: false })
  attachmentName?: string;

  @Prop({ type: String, required: false })
  attachmentMimeType?: string;

  @Prop({ required: true })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);

MessageSchema.index({ chatId: 1, createdAt: -1 });
