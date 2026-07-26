import { PaymentMethodCode } from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    example: 'PROMPTPAY',
    enum: ['PROMPTPAY', 'CASH'],
  })
  @IsIn(['PROMPTPAY', 'CASH'])
  @IsNotEmpty()
  method: PaymentMethodCode;
}
