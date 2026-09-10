import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StaffUserResponseDto } from '@/staff-user/dto/staff-user-response.dto';

@Exclude()
export class AuthLoginResponseDto extends BaseResponseDto<AuthLoginResponseDto> {
  @Expose()
  @ApiProperty({
    description:
      'JWT access token to send as a Bearer token on subsequent requests.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.abc123',
  })
  declare accessToken: string;

  @Expose()
  @ApiProperty({
    description:
      'Single-use token to exchange for a new access/refresh pair via POST /auth/refresh.',
  })
  declare refreshToken: string;

  @Expose()
  @ApiProperty({ description: 'Access token lifetime in seconds.' })
  declare expiresIn: number;

  @Expose()
  @Type(() => StaffUserResponseDto)
  @ApiProperty({ type: StaffUserResponseDto })
  declare user: StaffUserResponseDto;
}
