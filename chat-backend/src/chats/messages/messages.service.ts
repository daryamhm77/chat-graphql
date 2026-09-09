import { Inject, Injectable, BadRequestException, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import type { PubSubEngine } from 'graphql-subscriptions';
import { PUB_SUB } from '../../common/constants/injection-tokens';
import { S3Service } from '../../common/s3/s3.service';
import { UsersService } from '../../users/users.service';
import { ChatsService } from '../chats.service';
import { MESSAGE_CREATED } from './constants/pubsub-triggers';
import { CreateMessageInput } from './dto/create-message.input';
import { GetMessagesArgs } from './dto/get-messages.args';
import { Message } from './entities/message.entity';
import { MessageDocument } from './entities/message.document';
import { MessagesRepository } from './messages.repository';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
    @Inject(PUB_SUB) private readonly pubSub: PubSubEngine,
  ) {}

  async createMessage(
    createMessageInput: CreateMessageInput,
    userId: string,
  ): Promise<Message> {
    const {
      chatId,
      content,
      attachmentUrl,
      attachmentName,
      attachmentMimeType,
    } = createMessageInput;

    const trimmedContent = content?.trim() ?? '';
    if (!trimmedContent && !attachmentUrl) {
      throw new BadRequestException(
        'Message must include text content or an attachment.',
      );
    }

    if (attachmentUrl) {
      this.assertAttachmentUrl(attachmentUrl);
    }

    await this.chatsService.assertMembership(chatId, userId);

    const messageDocument = await this.messagesRepository.create({
      content: trimmedContent,
      chatId: new Types.ObjectId(chatId),
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
      ...(attachmentUrl
        ? {
            attachmentUrl,
            attachmentName,
            attachmentMimeType,
          }
        : {}),
    });

    const message = await this.toEntity(messageDocument, chatId, userId);

    await this.chatsService.touchLastRead(
      chatId,
      userId,
      messageDocument.createdAt,
    );

    await this.pubSub.publish(MESSAGE_CREATED, {
      messageCreated: message,
    });

    return message;
  }

  async uploadAttachment(
    file: Express.Multer.File,
    chatId: string,
    userId: string,
  ) {
    await this.chatsService.assertMembership(chatId, userId);

    const safeName = this.sanitizeFileName(file.originalname);
    const key = `${chatId}/${randomUUID()}-${safeName}`;

    await this.s3Service.upload({
      bucket: this.messagesBucket,
      key,
      file: file.buffer,
      contentType: file.mimetype,
    });

    return {
      url: this.s3Service.getObjectUrl(this.messagesBucket, key),
      fileName: safeName,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async getMessages(
    { chatId, skip, limit }: GetMessagesArgs,
    userId: string,
  ): Promise<Message[]> {
    await this.chatsService.assertMembership(chatId, userId);

    const messages = await this.messagesRepository.model
      .aggregate<{
        _id: Types.ObjectId;
        content: string;
        attachmentUrl?: string;
        attachmentName?: string;
        attachmentMimeType?: string;
        createdAt: Date;
        userDocs: Array<{
          _id: Types.ObjectId;
          email: string;
          username: string;
          password: string;
        }>;
      }>([
        { $match: { chatId: new Types.ObjectId(chatId) } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDocs',
          },
        },
      ])
      .exec();

    return messages
      .filter((message) => message.userDocs[0])
      .map((message) => ({
        _id: message._id,
        content: message.content,
        attachmentUrl: message.attachmentUrl,
        attachmentName: message.attachmentName,
        attachmentMimeType: message.attachmentMimeType,
        createdAt: message.createdAt,
        chatId,
        user: this.usersService.toEntity(message.userDocs[0]),
      }));
  }

  async countMessages(chatId: string, userId: string) {
    await this.chatsService.assertMembership(chatId, userId);
    const messages = await this.messagesRepository.model.countDocuments({
      chatId: new Types.ObjectId(chatId),
    });
    return { messages };
  }

  async countUnreadMessages(
    chatId: string,
    userId: string,
    lastReadAt: Date,
  ): Promise<number> {
    return this.messagesRepository.model.countDocuments({
      chatId: new Types.ObjectId(chatId),
      userId: { $ne: new Types.ObjectId(userId) },
      createdAt: { $gt: lastReadAt },
    });
  }

  async findLatestByChatId(chatId: string): Promise<Message | undefined> {
    const messageDoc = await this.messagesRepository.model
      .findOne({ chatId: new Types.ObjectId(chatId) })
      .sort({ createdAt: -1 })
      .lean();

    if (!messageDoc) {
      return undefined;
    }

    return this.toEntity(
      messageDoc as MessageDocument,
      chatId,
      messageDoc.userId.toHexString(),
    );
  }

  async deleteByChatId(chatId: string) {
    await this.messagesRepository.deleteMany({
      chatId: new Types.ObjectId(chatId),
    });
  }

  messageCreated() {
    return this.pubSub.asyncIterableIterator(MESSAGE_CREATED);
  }

  private async toEntity(
    messageDocument: Pick<
      MessageDocument,
      | '_id'
      | 'content'
      | 'attachmentUrl'
      | 'attachmentName'
      | 'attachmentMimeType'
      | 'createdAt'
    >,
    chatId: string,
    userId: string,
  ): Promise<Message> {
    return {
      _id: messageDocument._id,
      content: messageDocument.content,
      attachmentUrl: messageDocument.attachmentUrl,
      attachmentName: messageDocument.attachmentName,
      attachmentMimeType: messageDocument.attachmentMimeType,
      createdAt: messageDocument.createdAt,
      chatId,
      user: await this.usersService.findOne(userId),
    };
  }

  private get messagesBucket() {
    return this.configService.getOrThrow<string>('MINIO_MESSAGES_BUCKET');
  }

  private assertAttachmentUrl(url: string) {
    const prefix = `${this.s3Service.getObjectUrl(this.messagesBucket, '').replace(/\/$/, '')}/`;
    if (!url.startsWith(prefix)) {
      throw new BadRequestException('Invalid attachment URL.');
    }
  }

  private sanitizeFileName(originalName: string) {
    const base = originalName.split(/[/\\]/).pop() ?? 'file';
    const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);
    return sanitized || 'file';
  }
}
