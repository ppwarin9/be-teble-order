import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { CartItemResponseDto } from '@/cart/dto/cart-item-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class CartResponseDto extends BaseResponseDto<CartResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  declare tableSessionId: string;

  @Expose()
  @ApiProperty({ example: '2026-07-27T10:00:00.000Z' })
  declare updatedAt: Date;

  @Expose()
  @Type(() => CartItemResponseDto)
  @ApiProperty({ type: () => [CartItemResponseDto] })
  declare cartItems: CartItemResponseDto[];
}
