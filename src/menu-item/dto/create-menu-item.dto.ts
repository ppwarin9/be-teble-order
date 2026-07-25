import { Trim } from '@/common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({
    description: 'รหัสอ้างอิงหมวดหมู่เมนูอาหาร (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'ชื่อเมนูอาหาร',
    example: 'กะเพราหมูกรอบไข่ดาว',
  })
  @IsString()
  @IsNotEmpty()
  @Trim()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'คำอธิบายรายละเอียดเมนู',
    example:
      'หมูกรอบชิ้นโตผัดคลุกเคล้าซอสกะเพราสูตรเด็ดของร้าน เสิร์ฟพร้อมไข่ดาวเป็ดเยิ้มๆ',
  })
  @IsString()
  @IsNotEmpty()
  @Trim()
  @MaxLength(300)
  description: string;

  @ApiProperty({
    description: 'ราคาอาหาร (หน่วยเป็นสตางค์ เช่น 15000 = 150.00 บาท)',
    example: 15000,
  })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'ลิงก์รูปภาพของเมนูอาหาร (สามารถเว้นว่างได้หากยังไม่มีรูป)',
    example: 'https://storage.example.com/menu/krapow-moo-krob.jpg',
  })
  @IsUrl()
  @IsOptional()
  @Trim()
  imageUrl: string;

  @ApiProperty({
    description: 'เวลาที่ใช้ในการทำอาหารโดยประมาณ (นาที)',
    example: 15,
  })
  @IsInt()
  @Min(1)
  estimatedCookingMinutes: number;
}
