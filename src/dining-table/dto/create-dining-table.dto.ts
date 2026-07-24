import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, IsNotEmpty } from 'class-validator';

export class CreateDiningTableDto {
  @ApiProperty({
    description: 'Dining table number (alphanumeric only)',
    example: 'V1',
  })
  @IsAlphanumeric()
  @IsNotEmpty()
  tableNumber: string;
}
