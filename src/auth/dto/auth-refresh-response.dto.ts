import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class AuthRefreshResponseDto extends BaseResponseDto<AuthRefreshResponseDto> {
  @Expose()
  @ApiProperty({
    description:
      'New JWT access token to send as a Bearer token on subsequent requests.',
  })
  declare accessToken: string;

  @Expose()
  @ApiProperty({
    description:
      'New single-use refresh token — the one sent in the request is now revoked.',
  })
  declare refreshToken: string;

  @Expose()
  @ApiProperty({ description: 'Access token lifetime in seconds.' })
  declare expiresIn: number;
}
