import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DiningTableResponseDto extends BaseResponseDto<DiningTableResponseDto> {
  @ApiProperty({
    description: 'Unique identifier for the dining table (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  declare id: string;

  @ApiProperty({
    description: 'Dining table number (alphanumeric only)',
    example: 'T1',
  })
  @Expose()
  declare tableNumber: string;

  @ApiProperty({
    description: 'QR token used to generate the QR code for customer scanning',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @Expose()
  declare qrToken: string;

  @ApiProperty({
    description:
      'Date and time when the QR token was last generated or updated',
  })
  @Expose()
  declare qrGeneratedAt: Date;

  @ApiProperty({
    description: 'Table availability status (active/inactive)',
    example: true,
  })
  @Expose()
  declare isActive: boolean;
}
