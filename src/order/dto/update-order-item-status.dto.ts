import { OrderItemStatus } from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateOrderItemStatusDto {
  @ApiProperty({
    example: 'COOKING',
    enum: ['PENDING', 'COOKING', 'SERVED'],
    description:
      'Next status. Transitions must move forward one step at a time: PENDING -> COOKING -> SERVED.',
  })
  @IsIn(['PENDING', 'COOKING', 'SERVED'])
  @IsNotEmpty()
  status: OrderItemStatus;
}
