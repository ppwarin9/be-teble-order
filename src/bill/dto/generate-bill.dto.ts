import { SplitMethod } from '@/database/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class GenerateBillDto {
  @ApiProperty({
    example: 'EQUAL',
    enum: ['EQUAL', 'SINGLE_PAYER'],
  })
  @IsIn(['EQUAL', 'SINGLE_PAYER'])
  @IsNotEmpty()
  splitMethod: SplitMethod;

  @ApiPropertyOptional({
    description:
      'Required only when splitMethod is SINGLE_PAYER. Defaults to the requesting session member if omitted.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  payerSessionMemberId?: string;
}
