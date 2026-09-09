import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import type { TokenPayload } from '../auth/token-payload.interface';
import { PaginationArgs } from '../common/dto/pagination-args.dto';
import { ChatsService } from './chats.service';
import { CreateGroupChatInput } from './dto/create-group-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { Chat } from './entities/chat.entity';
import { UnreadSummary } from './entities/unread-summary.entity';

@Resolver(() => Chat)
export class ChatsResolver {
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  createGroupChat(
    @Args('createGroupChatInput') createGroupChatInput: CreateGroupChatInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.createGroupChat(createGroupChatInput, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  startDirectChat(
    @Args('userId') userId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.startDirectChat(userId, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Chat], { name: 'chats' })
  findAll(
    @Args() paginationArgs: PaginationArgs,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat[]> {
    return this.chatsService.findMany(user._id, paginationArgs);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Chat, { name: 'chat' })
  findOne(
    @Args('_id') _id: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.findOne(_id, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UnreadSummary, { name: 'unreadSummary' })
  unreadSummary(@CurrentUser() user: TokenPayload): Promise<UnreadSummary> {
    return this.chatsService.getUnreadSummary(user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  markChatAsRead(
    @Args('chatId') chatId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.markChatAsRead(chatId, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  updateChat(
    @Args('updateChatInput') updateChatInput: UpdateChatInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.updateChat(updateChatInput, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  removeChat(
    @Args('_id') _id: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.removeChat(_id, user._id);
  }
}
