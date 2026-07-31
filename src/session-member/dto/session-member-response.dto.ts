import { BaseResponseDto } from '@/common/dto/base-response.dto';
import type { SessionMemberWithCustomer } from '@/session-member/session-member.repository.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SessionMemberResponseDto extends BaseResponseDto<SessionMemberResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: 'Somchai' })
  displayName: string;

  @Expose()
  @ApiProperty({ example: 'https://profile.line-scdn.net/abcdef' })
  pictureUrl: string;

  @Expose()
  @ApiProperty({ example: '2026-07-27T10:00:00.000Z' })
  declare joinedAt: Date;

  constructor(sessionMember: SessionMemberWithCustomer) {
    super({
      id: sessionMember.id,
      joinedAt: sessionMember.joinedAt,
    });
    this.displayName = sessionMember.customer.displayName;
    this.pictureUrl = sessionMember.customer.pictureUrl;
  }
}
