import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DailySalesResponseDto extends BaseResponseDto<DailySalesResponseDto> {
  @Expose()
  @ApiProperty({ example: '2026-07-27' })
  declare date: string;

  @Expose()
  @ApiProperty({
    example: 458500,
    description: 'Sum of grandTotal across settled bills for the day',
  })
  declare totalSales: number;

  @Expose()
  @ApiProperty({
    example: 12,
    description: 'Number of settled bills for the day',
  })
  declare billCount: number;

  @Expose()
  @ApiProperty({
    example: 20,
    description: 'Number of order rounds submitted for the day',
  })
  declare orderCount: number;
}
