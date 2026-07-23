import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateStaffUserDto } from './create-staff-user.dto';

export class UpdateStaffUserDto extends PartialType(
  OmitType(CreateStaffUserDto, ['password'] as const),
) {
  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
