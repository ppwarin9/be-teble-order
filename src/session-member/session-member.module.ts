import { SessionMemberRepository } from '@/session-member/session-member.repository';
import { SessionMemberRepositoryInterface } from '@/session-member/session-member.repository.interface';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: SessionMemberRepositoryInterface,
      useClass: SessionMemberRepository,
    },
  ],
  exports: [SessionMemberRepositoryInterface],
})
export class SessionMemberModule {}
