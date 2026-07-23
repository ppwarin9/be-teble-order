import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class RoleResponseDto {
  @Expose()
  @ApiProperty({ example: '83728acd-1560-434a-8069-dc1fed651901' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'ADMIN' })
  code: string;

  @Expose()
  @ApiProperty({ example: 'Administrator' })
  name: string;
}
