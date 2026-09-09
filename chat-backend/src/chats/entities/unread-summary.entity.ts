import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UnreadSummary {
  @Field(() => Int)
  direct: number;

  @Field(() => Int)
  group: number;

  @Field(() => Int)
  total: number;
}
