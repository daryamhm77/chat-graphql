import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AbstractEntity } from '../../common/database/abstract.entity';
import { User } from '../../users/entities/user.entity';
import { Message } from '../messages/entities/message.entity';
import { ChatType } from './chat-type.enum';

@ObjectType()
export class Chat extends AbstractEntity {
  @Field({ nullable: true })
  name?: string;

  @Field(() => ChatType)
  type: ChatType;

  @Field(() => [User])
  participants: User[];

  @Field(() => Message, { nullable: true })
  latestMessage?: Message;

  @Field(() => Int)
  unreadCount: number;
}
