import { AuthenticatedSessionMember } from '@/auth/types/session.type';
import { SessionMemberRepository } from '@/session-member/session-member.repository';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

type RequestWithSessionMember = Request & {
  sessionMember?: AuthenticatedSessionMember;
};

@Injectable()
export class SessionTokenGuard implements CanActivate {
  constructor(
    private readonly sessionMemberRepository: SessionMemberRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithSessionMember>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing session token');
    }

    const member = await this.sessionMemberRepository.findByToken(token);

    if (!member) {
      throw new UnauthorizedException('Invalid session token');
    }

    if (member.tableSession.status !== 'OPEN') {
      throw new UnauthorizedException('This table session has been closed');
    }

    request.sessionMember = {
      id: member.id,
      customerId: member.customerId,
      tableSessionId: member.tableSessionId,
      tableSession: {
        id: member.tableSession.id,
        status: member.tableSession.status,
        diningTableId: member.tableSession.diningTableId,
      },
    };

    return true;
  }

  private extractBearerToken(
    request: RequestWithSessionMember,
  ): string | undefined {
    const header = request.headers.authorization;
    if (!header) {
      return undefined;
    }
    const [type, token] = header.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
