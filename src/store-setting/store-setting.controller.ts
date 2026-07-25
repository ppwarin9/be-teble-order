import { Roles } from '@/common/decorators/roles.decorator';
import { StoreSettingResponseDto } from '@/store-setting/dto/store-setting-response.dto';
import { UpdateStoreSettingDto } from '@/store-setting/dto/update-store-setting.dto';
import { StoreSettingService } from '@/store-setting/store-setting.service';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Store Setting')
@ApiBearerAuth()
@Controller('admin/store-setting')
export class StoreSettingController {
  constructor(private readonly storeSettingService: StoreSettingService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get Store Setting' })
  @ApiOkResponse({
    description: 'Store Setting details',
    type: StoreSettingResponseDto,
  })
  async get(): Promise<StoreSettingResponseDto> {
    const setting = await this.storeSettingService.get();
    return new StoreSettingResponseDto(setting);
  }

  @Patch()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update Store Setting Details' })
  @ApiOkResponse({
    description: 'Store Setting updated',
    type: StoreSettingResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  async update(
    @Body() updateStoreSettingDto: UpdateStoreSettingDto,
  ): Promise<StoreSettingResponseDto> {
    const setting = await this.storeSettingService.update(
      updateStoreSettingDto,
    );
    return new StoreSettingResponseDto(setting);
  }
}
