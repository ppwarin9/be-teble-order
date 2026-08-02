import { Trim } from '@/common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class JoinTableSessionDto {
  @ApiProperty({
    description: 'QR token printed on the dining table (identifies the table)',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsString()
  @IsNotEmpty()
  @Trim()
  qrToken: string;

  @ApiProperty({
    description:
      'LIFF ID token (JWT) obtained from liff.getIDToken() on the client. ' +
      'Verified server-side against LINE — this is what authenticates the ' +
      'customer, so their identity can never be spoofed by the request body.',
    example: 'eyJhbGciOiJIUzI1NiJ9...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiProperty({
    description: "The customer's LINE display name",
    example: 'Somchai',
  })
  @IsString()
  @IsNotEmpty()
  @Trim()
  displayName: string;

  @ApiProperty({
    description: "URL of the customer's LINE profile picture",
    example: 'https://profile.line-scdn.net/abcdef',
  })
  @IsUrl()
  @IsNotEmpty()
  @Trim()
  pictureUrl: string;
}
