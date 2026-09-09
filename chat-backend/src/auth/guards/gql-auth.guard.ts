import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { TokenPayload } from '../token-payload.interface';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<{
      req: Request & { user?: TokenPayload };
      user?: TokenPayload;
    }>().req;
  }

  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<{
      req?: Request & { user?: TokenPayload };
      user?: TokenPayload;
    }>();

    if (gqlContext.user && gqlContext.req && !gqlContext.req.user) {
      gqlContext.req.user = gqlContext.user;
    }

    if (gqlContext.req?.user) {
      return true;
    }

    return super.canActivate(context);
  }
}
