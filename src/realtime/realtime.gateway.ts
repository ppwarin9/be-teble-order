import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { SessionMemberRepositoryInterface } from '@/session-member/session-member.repository.interface';

const ADMIN_ROOM = 'admin';

/** Matches the room/event contract the frontend already implements against
 *  (table-order's docs/reference.md §7 / src/hooks/useRealtimeInvalidate.ts):
 *  a client emits 'join' with its tableSessionId, or 'join-admin' with no
 *  payload, and every RTEventType is emitted as its own bare (unwrapped)
 *  socket event to whichever room(s) are affected.
 *
 *  Both events require a token in the connection handshake (`auth.token`) —
 *  a customer sessionToken for 'join' (verified to actually belong to the
 *  requested tableSessionId, the same check SessionTokenGuard does for REST),
 *  or a staff JWT for 'join-admin'. A client that fails validation is not
 *  joined to any room and receives an 'error' event instead. */
@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN } })
export class RealtimeGateway {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionMemberRepository: SessionMemberRepositoryInterface,
  ) {}

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() tableSessionId: string,
  ): Promise<void> {
    const token = this.extractToken(client);
    if (!token) {
      client.emit('error', 'Missing session token');
      return;
    }

    const member = await this.sessionMemberRepository.findByToken(token);
    if (!member || member.tableSessionId !== tableSessionId) {
      client.emit('error', 'Not authorized for this table session');
      return;
    }

    void client.join(`table-session:${tableSessionId}`);
  }

  @SubscribeMessage('join-admin')
  handleJoinAdmin(@ConnectedSocket() client: Socket): void {
    const token = this.extractToken(client);
    if (!token) {
      client.emit('error', 'Missing token');
      return;
    }

    try {
      this.jwtService.verify(token);
    } catch {
      client.emit('error', 'Invalid or expired token');
      return;
    }

    void client.join(ADMIN_ROOM);
  }

  emitToTableSession(
    tableSessionId: string,
    event: string,
    payload: unknown,
  ): void {
    this.server.to(`table-session:${tableSessionId}`).emit(event, payload);
  }

  emitToAdmin(event: string, payload: unknown): void {
    this.server.to(ADMIN_ROOM).emit(event, payload);
  }

  private extractToken(client: Socket): string | undefined {
    const auth = client.handshake.auth as { token?: unknown };
    return typeof auth.token === 'string' ? auth.token : undefined;
  }
}
