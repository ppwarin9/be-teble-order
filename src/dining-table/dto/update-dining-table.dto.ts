import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateDiningTableDto } from './create-dining-table.dto';

export class UpdateDiningTableDto extends PartialType(CreateDiningTableDto) {
  @ApiProperty({
    description: 'Table availability status (active/inactive)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
