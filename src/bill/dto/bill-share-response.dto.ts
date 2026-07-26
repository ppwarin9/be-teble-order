import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { BillShareStatus } from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BillShareResponseDto extends BaseResponseDto<BillShareResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  declare billId: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440022' })
  declare sessionMemberId: string;

  @Expose()
  @ApiProperty({ example: 15000 })
  declare amountDue: number;

  @Expose()
  @ApiProperty({ example: 'UNPAID', enum: ['UNPAID', 'PAID'] })
  declare status: BillShareStatus;
}
