import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MenuCategoryResponseDto extends BaseResponseDto<MenuCategoryResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: 'อาหารจานเดี่ยว' })
  declare name: string;

  @Expose()
  @ApiProperty({ example: 1 })
  declare sortOrder: number;

  @Expose()
  @ApiProperty({ example: true })
  declare isActive: boolean;
}
