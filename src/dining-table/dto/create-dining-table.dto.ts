import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDiningTableDto {
  @ApiProperty({
    description: 'Dining table number (alphanumeric only)',
    example: 'V1',
  })
  @IsString()
  @IsNotEmpty()
  tableNumber: string;
}
