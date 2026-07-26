import { BaseResponseDto } from '@/common/dto/base-response.dto';
import {
  PaymentMethodCode,
  PaymentStatus,
} from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PaymentResponseDto extends BaseResponseDto<PaymentResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  declare billShareId: string;

  @Expose()
  @ApiProperty({ example: 'PROMPTPAY', enum: ['PROMPTPAY', 'CASH'] })
  declare method: PaymentMethodCode;

  @Expose()
  @ApiProperty({ example: 15000 })
  declare amount: number;

  @Expose()
  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'NOTIFIED', 'CONFIRMED', 'FAILED'],
  })
  declare status: PaymentStatus;

  @Expose()
  @ApiProperty({ example: null, required: false, nullable: true })
  declare notifiedAt?: Date | null;

  @Expose()
  @ApiProperty({ example: null, required: false, nullable: true })
  declare paidAt?: Date | null;

  @Expose()
  @ApiProperty({ example: '2026-07-27T10:00:00.000Z' })
  declare createdAt: Date;
}
