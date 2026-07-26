import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { MenuItemResponseDto } from '@/menu-item/dto/menu-item-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class CartItemResponseDto extends BaseResponseDto<CartItemResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  declare menuItemId: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440022' })
  declare addedBy: string;

  @Expose()
  @ApiProperty({ example: 2 })
  declare quantity: number;

  @Expose()
  @ApiProperty({ example: 'ไม่เผ็ด' })
  declare note: string;

  @Expose()
  @ApiProperty({ example: '2026-07-27T10:00:00.000Z' })
  declare addedAt: Date;

  @Expose()
  @Type(() => MenuItemResponseDto)
  @ApiProperty({ type: () => MenuItemResponseDto })
  declare menuItem: MenuItemResponseDto;
}
