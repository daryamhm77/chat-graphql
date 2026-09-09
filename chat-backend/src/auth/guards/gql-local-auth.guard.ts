import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { LoginInput } from '../dto/login.input';

export class GqlLocalAuthGuard extends AuthGuard('local') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext<{ req: Request }>().req;
    const { loginInput } = ctx.getArgs<{ loginInput: LoginInput }>();
    const existingBody =
      request.body && typeof request.body === 'object'
        ? (request.body as Record<string, unknown>)
        : {};
    request.body = { ...existingBody, ...loginInput };
    return request;
  }
}
