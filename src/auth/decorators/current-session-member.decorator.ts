import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type AuthenticatedSessionMember } from '@/auth/types/session.type';

export const CurrentSessionMember = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedSessionMember => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ sessionMember: AuthenticatedSessionMember }>();
    return request.sessionMember;
  },
);
