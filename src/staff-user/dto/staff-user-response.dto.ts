import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class StaffUserResponseDto extends BaseResponseDto<StaffUserResponseDto> {
  @Expose()
  @ApiProperty({ example: '83728acd-1560-434a-8069-dc1fed651901' })
  declare id: string;

  @Expose()
  @ApiProperty({ example: 'staff01@example.com' })
  declare email: string;

  @Expose()
  @ApiProperty({ example: 'John Doe' })
  declare name: string;

  @Expose()
  @ApiProperty({ example: '83728acd-1560-434a-8069-dc1fed651901' })
  declare roleId: string;

  @Expose()
  @ApiProperty({ example: true })
  declare isActive: boolean;

  @Expose()
  @ApiProperty({ example: '2026-01-15T08:30:00.000Z' })
  declare createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2026-01-15T08:30:00.000Z' })
  declare updatedAt: Date;
}
