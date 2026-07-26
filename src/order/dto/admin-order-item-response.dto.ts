import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { OrderItemStatus } from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AdminOrderItemResponseDto extends BaseResponseDto<AdminOrderItemResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  declare tableSessionId: string;

  @Expose()
  @ApiProperty({ example: 'T1' })
  declare tableNumber: string;

  @Expose()
  @ApiProperty({ example: 1 })
  declare roundNumber: number;

  @Expose()
  @ApiProperty({ example: 2 })
  declare quantity: number;

  @Expose()
  @ApiProperty({ example: 'กะเพราหมูกรอบไข่ดาว' })
  declare nameSnapshot: string;

  @Expose()
  @ApiProperty({ example: '' })
  declare note: string;

  @Expose()
  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'COOKING', 'SERVED'] })
  declare status: OrderItemStatus;

  @Expose()
  @ApiProperty({ example: null, required: false, nullable: true })
  declare startedAt?: Date | null;

  @Expose()
  @ApiProperty({ example: 15 })
  declare estimatedMinutes: number;
}
