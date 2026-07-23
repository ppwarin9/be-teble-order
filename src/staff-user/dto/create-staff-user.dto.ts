import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateStaffUserDto {
  @ApiProperty({
    example: 'staff01@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  password: string;

  @ApiProperty({
    example: 'สมชาย ใจดี',
  })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อ' })
  name: string;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID('4', { message: 'roleId ไม่ถูกต้อง' })
  roleId: string;
}
