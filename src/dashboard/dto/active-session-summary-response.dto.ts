import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ActiveSessionSummaryResponseDto extends BaseResponseDto<ActiveSessionSummaryResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare tableSessionId: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  declare diningTableId: string;

  @Expose()
  @ApiProperty({ example: 'T1' })
  declare tableNumber: string;

  @Expose()
  @ApiProperty({ example: '2026-07-27T10:00:00.000Z' })
  declare openedAt: Date;

  @Expose()
  @ApiProperty({ example: 4 })
  declare memberCount: number;

  @Expose()
  @ApiProperty({ example: 3, description: 'Order items not yet SERVED' })
  declare pendingItemCount: number;
}
