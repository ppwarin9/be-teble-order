import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMenuItemDto } from './create-menu-item.dto';

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {
  @ApiProperty({
    description:
      'สถานะความพร้อมขายของเมนู (ใช้สำหรับกดปิดเมื่อ "ของหมด" ชั่วคราว)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
