import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int)
  @IsInt()
  @Min(0)
  skip: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  limit: number;
}
