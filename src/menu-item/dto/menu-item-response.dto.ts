import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MenuItemResponseDto extends BaseResponseDto<MenuItemResponseDto> {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  declare categoryId: string;

  @Expose()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440022',
    required: false,
    nullable: true,
  })
  declare createdBy?: string | null;

  @Expose()
  @ApiProperty({ example: 'กะเพราหมูกรอบไข่ดาว' })
  declare name: string;

  @Expose()
  @ApiProperty({ example: 'หมูกรอบชิ้นโตผัดคลุกเคล้าซอสกะเพราสูตรเด็ด' })
  declare description: string;

  @Expose()
  @ApiProperty({ example: 15000 })
  declare price: number;

  @Expose()
  @ApiProperty({
    example: 'https://storage.example.com/menu/krapow.jpg',
    required: false,
    nullable: true,
  })
  declare imageUrl?: string | null;

  @Expose()
  @ApiProperty({ example: 15 })
  declare estimatedCookingMinutes: number;

  @Expose()
  @ApiProperty({ example: true })
  declare isAvailable: boolean;

  @Expose()
  @ApiProperty({ example: '2026-07-26T12:00:00.000Z' })
  declare createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2026-07-26T12:00:00.000Z' })
  declare updatedAt: Date;

  @Expose()
  @ApiProperty({ example: null, required: false, nullable: true })
  declare deletedAt?: Date | null;
}
