import { Trim } from '@/common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDiningTableDto {
  @ApiProperty({
    description: 'Dining table number (alphanumeric only)',
    example: 'V1',
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  tableNumber: string;
}
