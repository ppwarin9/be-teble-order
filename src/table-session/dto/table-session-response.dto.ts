import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { SessionStatus } from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TableSessionResponseDto extends BaseResponseDto<TableSessionResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  declare diningTableId: string;

  @Expose()
  @ApiProperty({ example: 'OPEN', enum: ['OPEN', 'CLOSED'] })
  declare status: SessionStatus;

  @Expose()
  @ApiProperty({ example: '2026-07-27T10:00:00.000Z' })
  declare openedAt: Date;

  @Expose()
  @ApiProperty({
    example: null,
    required: false,
    nullable: true,
  })
  declare closedAt?: Date | null;
}
