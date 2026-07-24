import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class StaffUserResponseDto {
  @Expose()
  @ApiProperty({ example: '83728acd-1560-434a-8069-dc1fed651901' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'staff01@example.com' })
  email: string;

  @Expose()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @Expose()
  @ApiProperty({ example: '83728acd-1560-434a-8069-dc1fed651901' })
  roleId: string;

  @Expose()
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty({ example: '2026-01-15T08:30:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2026-01-15T08:30:00.000Z' })
  updatedAt: Date;
}
