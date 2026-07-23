import { Module } from '@nestjs/common';
import { StoreSettingService } from './store-setting.service';
import { StoreSettingController } from './store-setting.controller';

@Module({
  providers: [StoreSettingService],
  controllers: [StoreSettingController]
})
export class StoreSettingModule {}
