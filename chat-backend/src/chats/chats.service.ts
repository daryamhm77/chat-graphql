import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PipelineStage, Types } from 'mongoose';
import { PaginationArgs } from '../common/dto/pagination-args.dto';
import { UsersService } from '../users/users.service';
import { ChatsRepository } from './chats.repository';
import { CreateGroupChatInput } from './dto/create-group-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { ChatType } from './entities/chat-type.enum';
import { ChatDocument } from './entities/chat.document';
import { Chat } from './entities/chat.entity';
import { UnreadSummary } from './entities/unread-summary.entity';
import { Message } from './messages/entities/message.entity';
import { MessagesService } from './messages/messages.service';
import { AggregatedChat } from './types';

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  async createGroupChat(
    createGroupChatInput: CreateGroupChatInput,
    creatorId: string,
  ): Promise<Chat> {
    const participantIdSet = new Set([
      creatorId,
      ...createGroupChatInput.participantIds,
    ]);
    const participantIds = [...participantIdSet];
    await this.ensureUsersExist(participantIds);

    const chatDocument = await this.chatsRepository.create({
      name: createGroupChatInput.name,
      type: ChatType.GROUP,
      creatorId: new Types.ObjectId(creatorId),
      participantIds: participantIds.map((id) => new Types.ObjectId(id)),
      lastReadAtByUser: new Map([[creatorId, new Date()]]),
    });

    return this.toEntity(chatDocument, creatorId);
  }

  async startDirectChat(
    otherUserId: string,
    currentUserId: string,
  ): Promise<Chat> {
    if (otherUserId === currentUserId) {
      throw new BadRequestException(
        'Cannot start a direct chat with yourself.',
      );
    }

    await this.ensureUsersExist([otherUserId]);

    const dmKey = this.buildDmKey(currentUserId, otherUserId);
    const existing = await this.chatsRepository.model
      .findOne({ dmKey, type: ChatType.DIRECT })
      .lean();

    if (existing) {
      return this.toEntity(existing, currentUserId);
    }

    try {
      const chatDocument = await this.chatsRepository.create({
        type: ChatType.DIRECT,
        creatorId: new Types.ObjectId(currentUserId),
        participantIds: [
          new Types.ObjectId(currentUserId),
          new Types.ObjectId(otherUserId),
        ],
        dmKey,
        lastReadAtByUser: new Map([[currentUserId, new Date()]]),
      });
      return this.toEntity(chatDocument, currentUserId);
    } catch (err) {
      if (this.isDuplicateKeyError(err)) {
        const chat = await this.chatsRepository.model.findOne({ dmKey }).lean();
        if (chat) {
          return this.toEntity(chat, currentUserId);
        }
      }
      throw err;
    }
  }

  async findMany(
    userId: string,
    paginationArgs: PaginationArgs,
  ): Promise<Chat[]> {
    const userObjectId = new Types.ObjectId(userId);
    const chats = await this.chatsRepository.model
      .aggregate<AggregatedChat>([
        { $match: { participantIds: userObjectId } },
        ...this.chatDetailStages(userId),
        {
          $addFields: {
            sortDate: {
              $ifNull: ['$latestMessage.createdAt', new Date(0)],
            },
          },
        },
        { $sort: { sortDate: -1, _id: -1 } },
        { $skip: paginationArgs.skip },
        { $limit: paginationArgs.limit },
        { $project: { sortDate: 0 } },
      ])
      .exec();

    return chats.map((chat) => this.mapAggregatedChat(chat));
  }

  async findOne(_id: string, userId: string): Promise<Chat> {
    await this.assertMembership(_id, userId);
    const chats = await this.findManyByIds([_id], userId);
    if (!chats[0]) {
      throw new NotFoundException(`No chat was found with ID ${_id}`);
    }
    return chats[0];
  }

  async updateChat(
    updateChatInput: UpdateChatInput,
    userId: string,
  ): Promise<Chat> {
    const chat = await this.assertMembership(updateChatInput._id, userId);

    if (chat.type !== ChatType.GROUP) {
      throw new BadRequestException('Only group chats can be renamed.');
    }

    if (!updateChatInput.name) {
      throw new BadRequestException('Name is required to update a chat.');
    }

    const updated = await this.chatsRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(updateChatInput._id) },
      { $set: { name: updateChatInput.name } },
    );

    return this.toEntity(updated, userId);
  }

  async removeChat(_id: string, userId: string): Promise<Chat> {
    const chat = await this.assertMembership(_id, userId);

    if (chat.creatorId.toHexString() !== userId) {
      throw new ForbiddenException(
        'Only the chat creator can remove this chat.',
      );
    }

    const removed = await this.chatsRepository.findOneAndDelete({
      _id: new Types.ObjectId(_id),
    });
    await this.messagesService.deleteByChatId(_id);

    return this.toEntity(removed, userId);
  }

  async markChatAsRead(chatId: string, userId: string): Promise<Chat> {
    await this.assertMembership(chatId, userId);

    const latest = await this.messagesService.findLatestByChatId(chatId);
    const readAt = latest?.createdAt ?? new Date();

    await this.chatsRepository.model.updateOne(
      { _id: new Types.ObjectId(chatId) },
      { $set: { [`lastReadAtByUser.${userId}`]: readAt } },
    );

    return this.findOne(chatId, userId);
  }

  async touchLastRead(chatId: string, userId: string, readAt: Date) {
    await this.chatsRepository.model.updateOne(
      { _id: new Types.ObjectId(chatId) },
      { $set: { [`lastReadAtByUser.${userId}`]: readAt } },
    );
  }

  async getUnreadSummary(userId: string): Promise<UnreadSummary> {
    const userObjectId = new Types.ObjectId(userId);
    const rows = await this.chatsRepository.model
      .aggregate<{ _id: ChatType; unread: number }>([
        { $match: { participantIds: userObjectId } },
        ...this.unreadCountStages(userId),
        {
          $group: {
            _id: '$type',
            unread: { $sum: '$unreadCount' },
          },
        },
      ])
      .exec();

    const direct =
      rows.find((row) => row._id === ChatType.DIRECT)?.unread ?? 0;
    const group = rows.find((row) => row._id === ChatType.GROUP)?.unread ?? 0;

    return {
      direct,
      group,
      total: direct + group,
    };
  }

  async countChats(userId: string) {
    return this.chatsRepository.model.countDocuments({
      participantIds: new Types.ObjectId(userId),
    });
  }

  async assertMembership(
    chatId: string,
    userId: string,
  ): Promise<ChatDocument> {
    const chat = await this.chatsRepository.model
      .findOne({
        _id: new Types.ObjectId(chatId),
        participantIds: new Types.ObjectId(userId),
      })
      .lean();

    if (!chat) {
      throw new ForbiddenException('You are not a participant of this chat.');
    }

    return chat;
  }

  async isParticipant(chatId: string, userId: string): Promise<boolean> {
    const count = await this.chatsRepository.model.countDocuments({
      _id: new Types.ObjectId(chatId),
      participantIds: new Types.ObjectId(userId),
    });
    return count > 0;
  }

  private async findManyByIds(
    chatIds: string[],
    userId: string,
  ): Promise<Chat[]> {
    const objectIds = chatIds.map((id) => new Types.ObjectId(id));
    const userObjectId = new Types.ObjectId(userId);
    const chats = await this.chatsRepository.model
      .aggregate<AggregatedChat>([
        {
          $match: {
            _id: { $in: objectIds },
            participantIds: userObjectId,
          },
        },
        ...this.chatDetailStages(userId),
      ])
      .exec();

    return chats.map((chat) => this.mapAggregatedChat(chat));
  }

  private chatDetailStages(userId: string): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$chatId', '$$chatId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userDocs',
              },
            },
          ],
          as: 'latestMessages',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'participantIds',
          foreignField: '_id',
          as: 'participantDocs',
        },
      },
      {
        $addFields: {
          latestMessage: { $arrayElemAt: ['$latestMessages', 0] },
        },
      },
      ...this.unreadCountStages(userId),
      { $project: { latestMessages: 0 } },
    ];
  }

  private unreadCountStages(userId: string): PipelineStage[] {
    const userObjectId = new Types.ObjectId(userId);
    return [
      {
        $lookup: {
          from: 'messages',
          let: {
            chatId: '$_id',
            lastReadAt: {
              $let: {
                vars: {
                  entry: {
                    $first: {
                      $filter: {
                        input: {
                          $objectToArray: {
                            $ifNull: ['$lastReadAtByUser', {}],
                          },
                        },
                        as: 'item',
                        cond: { $eq: ['$$item.k', userId] },
                      },
                    },
                  },
                },
                in: { $ifNull: ['$$entry.v', new Date(0)] },
              },
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$chatId', '$$chatId'] },
                    { $gt: ['$createdAt', '$$lastReadAt'] },
                    { $ne: ['$userId', userObjectId] },
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'unreadDocs',
        },
      },
      {
        $addFields: {
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ['$unreadDocs.count', 0] }, 0],
          },
        },
      },
      { $project: { unreadDocs: 0 } },
    ];
  }

  private async toEntity(
    chatDocument: ChatDocument,
    userId: string,
  ): Promise<Chat> {
    const participants = await this.usersService.findManyByIds(
      chatDocument.participantIds.map((id) => id.toHexString()),
    );

    const latestMessage = await this.messagesService.findLatestByChatId(
      chatDocument._id.toHexString(),
    );

    const unreadCount = await this.countUnreadForChat(
      chatDocument._id.toHexString(),
      userId,
      chatDocument.lastReadAtByUser,
    );

    return {
      _id: chatDocument._id,
      name: chatDocument.name,
      type: chatDocument.type,
      participants,
      latestMessage,
      unreadCount,
    };
  }

  private async countUnreadForChat(
    chatId: string,
    userId: string,
    lastReadAtByUser?: Map<string, Date> | Record<string, Date>,
  ) {
    let lastReadAt = new Date(0);
    if (lastReadAtByUser instanceof Map) {
      lastReadAt = lastReadAtByUser.get(userId) ?? new Date(0);
    } else if (lastReadAtByUser && typeof lastReadAtByUser === 'object') {
      lastReadAt = lastReadAtByUser[userId]
        ? new Date(lastReadAtByUser[userId])
        : new Date(0);
    }

    return this.messagesService.countUnreadMessages(
      chatId,
      userId,
      lastReadAt,
    );
  }

  private mapAggregatedChat(chat: AggregatedChat): Chat {
    const participants = (chat.participantDocs ?? []).map((user) =>
      this.usersService.toEntity(user),
    );

    let latestMessage: Message | undefined;
    if (chat.latestMessage?._id) {
      const userDoc = chat.latestMessage.userDocs?.[0];
      if (userDoc) {
        latestMessage = {
          _id: chat.latestMessage._id,
          content: chat.latestMessage.content,
          attachmentUrl: chat.latestMessage.attachmentUrl,
          attachmentName: chat.latestMessage.attachmentName,
          attachmentMimeType: chat.latestMessage.attachmentMimeType,
          createdAt: chat.latestMessage.createdAt,
          chatId: chat._id.toHexString(),
          user: this.usersService.toEntity(userDoc),
        };
      }
    }

    return {
      _id: chat._id,
      name: chat.name,
      type: chat.type,
      participants,
      latestMessage,
      unreadCount: chat.unreadCount ?? 0,
    };
  }

  private buildDmKey(userIdA: string, userIdB: string) {
    return [userIdA, userIdB].sort().join(':');
  }

  private async ensureUsersExist(userIds: string[]) {
    const users = await this.usersService.findManyByIds(userIds);
    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more participants were not found.');
    }
  }

  private isDuplicateKeyError(err: unknown) {
    if (!err || typeof err !== 'object') {
      return false;
    }
    const error = err as { code?: number; message?: string };
    return error.code === 11000 || error.message?.includes('E11000');
  }
}
