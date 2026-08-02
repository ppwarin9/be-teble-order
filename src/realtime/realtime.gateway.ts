import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const ADMIN_ROOM = 'admin';

/** Matches the room/event contract the frontend already implements against
 *  (table-order's docs/reference.md §7 / src/hooks/useRealtimeInvalidate.ts):
 *  a client emits 'join' with its tableSessionId, or 'join-admin' with no
 *  payload, and every RTEventType is emitted as its own bare (unwrapped)
 *  socket event to whichever room(s) are affected. */
@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN } })
export class RealtimeGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() tableSessionId: string,
  ): void {
    void client.join(`table-session:${tableSessionId}`);
  }

  @SubscribeMessage('join-admin')
  handleJoinAdmin(@ConnectedSocket() client: Socket): void {
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
}
