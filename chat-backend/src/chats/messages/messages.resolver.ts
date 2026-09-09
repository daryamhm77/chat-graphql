import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { Inject, UseGuards, forwardRef } from '@nestjs/common';
import { CurrentUser } from '../../auth/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import type { TokenPayload } from '../../auth/token-payload.interface';
import { ChatsService } from '../chats.service';
import { CreateMessageInput } from './dto/create-message.input';
import { GetMessagesArgs } from './dto/get-messages.args';
import { MessageCreatedArgs } from './dto/message-created.args';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';

type GqlSubscriptionContext = {
  req?: { user?: TokenPayload };
  user?: TokenPayload;
};

@Resolver(() => Message)
export class MessagesResolver {
  constructor(
    private readonly messagesService: MessagesService,
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
  ) {}

  @Mutation(() => Message)
  @UseGuards(GqlAuthGuard)
  createMessage(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Message> {
    return this.messagesService.createMessage(createMessageInput, user._id);
  }

  @Query(() => [Message], { name: 'messages' })
  @UseGuards(GqlAuthGuard)
  getMessages(
    @Args() getMessagesArgs: GetMessagesArgs,
    @CurrentUser() user: TokenPayload,
  ): Promise<Message[]> {
    return this.messagesService.getMessages(getMessagesArgs, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Subscription(() => Message, {
    filter: (
      payload: { messageCreated: Message },
      variables: MessageCreatedArgs,
      context: GqlSubscriptionContext,
    ) => {
      const user = context.req?.user ?? context.user;
      if (!user) {
        return false;
      }

      const message = payload.messageCreated;
      const senderId =
        typeof message.user._id === 'string'
          ? message.user._id
          : message.user._id.toHexString();

      return (
        variables.chatIds.includes(message.chatId) && user._id !== senderId
      );
    },
  })
  async messageCreated(
    @Args() messageCreatedArgs: MessageCreatedArgs,
    @Context() context: GqlSubscriptionContext,
  ) {
    const user = context.req?.user ?? context.user;
    if (user) {
      await Promise.all(
        messageCreatedArgs.chatIds.map((chatId) =>
          this.chatsService.assertMembership(chatId, user._id),
        ),
      );
    }
    return this.messagesService.messageCreated();
  }
}
