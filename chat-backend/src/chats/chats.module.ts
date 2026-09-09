import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { UsersModule } from '../users/users.module';
import { ChatsController } from './chats.controller';
import { ChatsRepository } from './chats.repository';
import { ChatsResolver } from './chats.resolver';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';
import { ChatSchema } from './entities/chat.document';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    UsersModule,
    DatabaseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    forwardRef(() => MessagesModule),
  ],
  providers: [ChatsResolver, ChatsService, ChatsRepository],
  exports: [ChatsService],
  controllers: [ChatsController],
})
export class ChatsModule {}
