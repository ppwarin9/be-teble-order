import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMenuCategoryDto } from './create-menu-category.dto';

export class UpdateMenuCategoryDto extends PartialType(CreateMenuCategoryDto) {
  @ApiProperty({
    description:
      'สถานะการเปิด/ปิดหมวดหมู่เมนู (เอาไว้ซ่อนหมวดหมู่นี้ไม่ให้ลูกค้าเห็น)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
