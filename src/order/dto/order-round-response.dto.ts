import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { OrderItemResponseDto } from '@/order/dto/order-item-response.dto';
import { OrderRoundStatus } from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class OrderRoundResponseDto extends BaseResponseDto<OrderRoundResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  declare tableSessionId: string;

  @Expose()
  @ApiProperty({ example: 1 })
  declare roundNumber: number;

  @Expose()
  @ApiProperty({ example: 'SUBMITTED', enum: ['SUBMITTED', 'COMPLETED'] })
  declare status: OrderRoundStatus;

  @Expose()
  @ApiProperty({ example: '2026-07-27T10:00:00.000Z' })
  declare submittedAt: Date;

  @Expose()
  @Type(() => OrderItemResponseDto)
  @ApiProperty({ type: () => [OrderItemResponseDto] })
  declare orderItems: OrderItemResponseDto[];
}
