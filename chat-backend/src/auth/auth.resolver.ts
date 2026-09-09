import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import type { Response } from 'express';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginInput } from './dto/login.input';
import { GqlLocalAuthGuard } from './guards/gql-local-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => String)
  @UseGuards(GqlLocalAuthGuard)
  login(
    @Args('loginInput') _loginInput: LoginInput,
    @CurrentUser() user: User,
    @Context() context: { res: Response },
  ) {
    return this.authService.login(user, context.res);
  }

  @Mutation(() => Boolean)
  logout(@Context() context: { res: Response }) {
    this.authService.logout(context.res);
    return true;
  }
}
