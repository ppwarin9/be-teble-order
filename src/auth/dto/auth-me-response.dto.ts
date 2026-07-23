import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class AuthMeResponseDto {
  @Expose()
  @ApiProperty({ example: '83728acd-1560-434a-8069-dc1fed651901' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @Expose()
  @ApiProperty({
    example: 'ADMIN',
    description: 'Role code of the logged-in staff.',
  })
  role: string;
}
