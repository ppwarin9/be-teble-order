import { Module } from '@nestjs/common';
import { SessionMemberRepository } from '@/session-member/session-member.repository';

@Module({
  providers: [SessionMemberRepository],
  exports: [SessionMemberRepository],
})
export class SessionMemberModule {}
