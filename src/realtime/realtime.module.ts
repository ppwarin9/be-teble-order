import { Global, Module } from '@nestjs/common';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import { JwtModule } from '@/infrastructure/jwt/jwt.module';
import { SessionMemberModule } from '@/session-member/session-member.module';

@Global()
@Module({
  imports: [JwtModule, SessionMemberModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
