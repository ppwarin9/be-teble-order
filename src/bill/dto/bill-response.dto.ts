import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { BillShareResponseDto } from '@/bill/dto/bill-share-response.dto';
import { BillStatus, SplitMethod } from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class BillResponseDto extends BaseResponseDto<BillResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  declare tableSessionId: string;

  @Expose()
  @ApiProperty({ example: 'OPEN', enum: ['OPEN', 'SETTLED', 'VOID'] })
  declare status: BillStatus;

  @Expose()
  @ApiProperty({ example: 'EQUAL', enum: ['EQUAL', 'SINGLE_PAYER'] })
  declare splitMethod: SplitMethod;

  @Expose()
  @ApiProperty({ example: 50000 })
  declare subtotal: number;

  @Expose()
  @ApiProperty({ example: 0.1 })
  declare serviceChargeRateSnapshot: number;

  @Expose()
  @ApiProperty({ example: 5000 })
  declare serviceChargeAmount: number;

  @Expose()
  @ApiProperty({ example: 0.07 })
  declare vatRateSnapShot: number;

  @Expose()
  @ApiProperty({ example: 3850 })
  declare vatAmount: number;

  @Expose()
  @ApiProperty({ example: 58850 })
  declare grandTotal: number;

  @Expose()
  @ApiProperty({ example: 'THB' })
  declare currencySnapShot: string;

  @Expose()
  @ApiProperty({ example: '2026-07-27T10:00:00.000Z' })
  declare issuedAt: Date;

  @Expose()
  @ApiProperty({ example: null, required: false, nullable: true })
  declare settledAt?: Date | null;

  @Expose()
  @Type(() => BillShareResponseDto)
  @ApiProperty({ type: () => [BillShareResponseDto] })
  declare billShares: BillShareResponseDto[];
}
