import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { MessageDocument } from './entities/message.document';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesRepository extends AbstractRepository<MessageDocument> {
  protected readonly logger = new Logger(MessagesRepository.name);

  constructor(@InjectModel(Message.name) messageModel: Model<MessageDocument>) {
    super(messageModel);
  }

  async deleteMany(filterQuery: { chatId: Types.ObjectId }) {
    await this.model.deleteMany(filterQuery);
  }
}
