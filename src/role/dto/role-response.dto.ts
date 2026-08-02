import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { RoleCode } from '@/database/generated/prisma/enums';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class RoleResponseDto extends BaseResponseDto<RoleResponseDto> {
  @Expose()
  @ApiProperty({ example: '83728acd-1560-434a-8069-dc1fed651901' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: 'ADMIN', enum: RoleCode })
  declare code: RoleCode;

  @Expose()
  @ApiProperty({ example: 'Administrator' })
  declare name: string;
}
