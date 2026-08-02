import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { AdminBillShareResponseDto } from '@/table-session/dto/admin-bill-share-response.dto';
import { BillStatus } from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class AdminBillResponseDto extends BaseResponseDto<AdminBillResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  declare tableSessionId: string;

  @Expose()
  @ApiProperty({ example: 50000 })
  declare subtotal: number;

  @Expose()
  @ApiProperty({ example: 5000 })
  declare serviceChargeAmount: number;

  @Expose()
  @ApiProperty({ example: 3850 })
  declare vatAmount: number;

  @Expose()
  @ApiProperty({ example: 58850 })
  declare grandTotal: number;

  @Expose()
  @ApiProperty({ example: 'OPEN', enum: ['OPEN', 'SETTLED', 'VOID'] })
  declare status: BillStatus;

  @Expose()
  @Type(() => AdminBillShareResponseDto)
  @ApiProperty({ type: () => [AdminBillShareResponseDto] })
  declare shares: AdminBillShareResponseDto[];
}
