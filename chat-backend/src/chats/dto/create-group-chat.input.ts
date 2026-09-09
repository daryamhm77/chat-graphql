import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayUnique,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';

@InputType()
export class CreateGroupChatInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  participantIds: string[];
}
