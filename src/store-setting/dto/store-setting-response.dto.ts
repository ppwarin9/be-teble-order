import { SplitMethod } from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class StoreSettingResponseDto {
  @Expose()
  @ApiProperty({ example: '83728acd-xxxxxx-xxxxx-xxxxx' })
  id: string;

  @Expose()
  @ApiProperty({ example: true })
  enableVat: boolean;

  @Expose()
  @ApiProperty({ example: 0.07 })
  vatRate: number;

  @Expose()
  @ApiProperty({ example: false })
  enableServiceCharge: boolean;

  @Expose()
  @ApiProperty({ example: 0.1 })
  serviceCharge: number;

  @Expose()
  @ApiProperty({ example: 'THB' })
  currency: string;

  @Expose()
  @ApiProperty({ example: 'Asia/Bangkok' })
  timezone: string;

  @Expose()
  @ApiProperty({
    example: 'EQUAL',
    enum: ['EQUAL', 'SINGLE_PAYER'],
  })
  defaultSplitMethod: SplitMethod;
}
