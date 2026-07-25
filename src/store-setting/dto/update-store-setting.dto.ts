import { Trim } from '@/common/decorators/trim.decorator';
import { SplitMethod } from '@/database/generated/prisma/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsIn,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateStoreSettingDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'enableVat must be a boolean' })
  enableVat?: boolean;

  @ApiPropertyOptional({ example: 0.07 })
  @IsOptional()
  @IsNumber({}, { message: 'vatRate must be a number' })
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
  @Trim()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Asia/Bangkok' })
  @Trim()
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
