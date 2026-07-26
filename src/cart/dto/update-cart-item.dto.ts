import { Trim } from '@/common/decorators/trim.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ example: 'ไม่เผ็ด' })
  @IsString()
  @IsOptional()
  @Trim()
  note?: string;
}
