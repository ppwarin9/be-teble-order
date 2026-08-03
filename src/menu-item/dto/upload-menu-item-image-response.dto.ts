import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UploadMenuItemImageResponseDto extends BaseResponseDto<UploadMenuItemImageResponseDto> {
  @Expose()
  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1/table-order/menu-items/abc123.jpg',
  })
  declare imageUrl: string;
}
