import { Trim } from '@/common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'ADMIN',
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'Administrator',
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  name: string;
}
