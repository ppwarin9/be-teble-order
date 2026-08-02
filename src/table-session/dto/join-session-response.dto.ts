import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { TableSessionResponseDto } from '@/table-session/dto/table-session-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class JoinSessionResponseDto extends BaseResponseDto<JoinSessionResponseDto> {
  @Expose()
  @ApiProperty({
    description: 'Bearer token to use for all subsequent customer requests',
    example: '9f2c1a4b-3d5e-4f6a-8b7c-1234567890ab',
  })
  declare sessionToken: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440033' })
  declare sessionMemberId: string;

  @Expose()
  @ApiProperty({
    description: 'Human-readable table number, for display only',
    example: '12',
  })
  declare tableNumber: string;

  @Expose()
  @Type(() => TableSessionResponseDto)
  @ApiProperty({ type: () => TableSessionResponseDto })
  declare tableSession: TableSessionResponseDto;
}
