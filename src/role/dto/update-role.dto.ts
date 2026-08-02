import { Trim } from '@/common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    example: 'Administrator',
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  name: string;
}
