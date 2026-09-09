import { Field, InputType } from '@nestjs/graphql';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class CreateMessageInput {
  @Field({ nullable: true })
  @ValidateIf((input: CreateMessageInput) => !input.attachmentUrl)
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: false })
  attachmentUrl?: string;

  @Field({ nullable: true })
  @ValidateIf((input: CreateMessageInput) => Boolean(input.attachmentUrl))
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  attachmentName?: string;

  @Field({ nullable: true })
  @ValidateIf((input: CreateMessageInput) => Boolean(input.attachmentUrl))
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  attachmentMimeType?: string;

  @Field()
  @IsMongoId()
  chatId: string;
}
