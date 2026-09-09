import { ArgsType, Field } from '@nestjs/graphql';
import { ArrayNotEmpty, IsArray, IsMongoId } from 'class-validator';

@ArgsType()
export class MessageCreatedArgs {
  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  chatIds: string[];
}
