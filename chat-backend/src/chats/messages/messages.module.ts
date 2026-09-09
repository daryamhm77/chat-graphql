import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { S3Module } from '../../common/s3/s3.module';
import { UsersModule } from '../../users/users.module';
import { ChatsModule } from '../chats.module';
import { Message } from './entities/message.entity';
import { MessageSchema } from './entities/message.document';
import { MessagesController } from './messages.controller';
import { MessagesRepository } from './messages.repository';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    S3Module,
    UsersModule,
    DatabaseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    forwardRef(() => ChatsModule),
  ],
  providers: [MessagesResolver, MessagesService, MessagesRepository],
  exports: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
