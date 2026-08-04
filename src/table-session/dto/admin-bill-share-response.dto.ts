import { BaseResponseDto } from '@/common/dto/base-response.dto';
import {
  BillShareStatus,
  PaymentMethodCode,
} from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AdminBillShareResponseDto extends BaseResponseDto<AdminBillShareResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({
    description: "The paying member's display name",
    example: 'สมชาย ใจดี',
  })
  declare label: string;

  @Expose()
  @ApiProperty({ example: 15000 })
  declare amountDue: number;

  @Expose()
  @ApiProperty({ example: 'UNPAID', enum: ['UNPAID', 'PAID'] })
  declare status: BillShareStatus;

  @Expose()
  @ApiProperty({
    description: 'Method of the CONFIRMED payment for this share, if any.',
    example: 'CASH',
    enum: ['PROMPTPAY', 'CASH'],
    nullable: true,
  })
  declare method: PaymentMethodCode | null;

  @Expose()
  @ApiProperty({
    description:
      'ID of a PENDING/NOTIFIED payment awaiting staff action, if any — pass this to ' +
      'PATCH /admin/payments/:id/confirm or /fail. Null if the customer never started a ' +
      'payment for this share (use the cash endpoint directly in that case).',
    nullable: true,
  })
  declare pendingPaymentId: string | null;

  @Expose()
  @ApiProperty({
    description: "The pending payment's method, if any.",
    enum: ['PROMPTPAY', 'CASH'],
    nullable: true,
  })
  declare pendingPaymentMethod: PaymentMethodCode | null;
}
