import { Trim } from '@/common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateMenuCategoryDto {
  @ApiProperty({
    description: 'The name of the menu category (e.g., Main Dish, Drinks)',
    example: 'อาหารจานเดี่ยว',
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description:
      'The display order of the category (must be a positive integer)',
    example: 1,
  })
  @IsInt()
  @Min(0)
  sortOrder: number;
}
