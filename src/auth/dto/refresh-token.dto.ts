import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token issued by POST /auth/login or /auth/refresh.',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
