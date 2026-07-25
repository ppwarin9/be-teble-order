import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { SplitMethod } from '@/database/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class StoreSettingResponseDto extends BaseResponseDto<StoreSettingResponseDto> {
  @Expose()
  @ApiProperty({ example: '83728acd-xxxxxx-xxxxx-xxxxx' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: true })
  declare enableVat: boolean;

  @Expose()
  @ApiProperty({ example: 0.07 })
  declare vatRate: number;

  @Expose()
  @ApiProperty({ example: false })
  declare enableServiceCharge: boolean;

  @Expose()
  @ApiProperty({ example: 0.1 })
  declare serviceChargeRate: number;

  @Expose()
  @ApiProperty({ example: 'THB' })
  declare currency: string;

  @Expose()
  @ApiProperty({ example: 'Asia/Bangkok' })
  declare timezone: string;

  @Expose()
  @ApiProperty({
    example: 'EQUAL',
    enum: ['EQUAL', 'SINGLE_PAYER'],
  })
  declare defaultSplitMethod: SplitMethod;

  @Expose()
  @ApiProperty({ example: '2026-07-24T09:13:04.000Z' })
  declare updatedAt: Date;
}
