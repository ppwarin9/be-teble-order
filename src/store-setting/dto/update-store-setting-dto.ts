import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsIn,
  IsOptional,
  Min,
} from 'class-validator';

export type SplitMethod = 'EQUAL' | 'SINGLE_PAYER';

export class UpdateStoreSettingDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'enableVat ต้องเป็น boolean' })
  enableVat?: boolean;

  @ApiPropertyOptional({ example: 0.07 })
  @IsOptional()
  @IsNumber({}, { message: 'vatRate ต้องเป็นตัวเลข' })
  @Min(0)
  vatRate?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  enableServiceCharge?: boolean;

  @ApiPropertyOptional({ example: 0.1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceChargeRate?: number;

  @ApiPropertyOptional({ example: 'THB' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Asia/Bangkok' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    example: 'SINGLE_PAYER',
    enum: ['EQUAL', 'SINGLE_PAYER'],
  })
  @IsOptional()
  @IsIn(['EQUAL', 'SINGLE_PAYER'])
  defaultSplitMethod?: SplitMethod;
}
