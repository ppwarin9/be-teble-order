import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { StoreSettingService } from './store-setting.service';
import { StoreSettingController } from './store-setting.controller';
import { StoreSettingRepository } from './store-setting.repository';

@Module({
  imports: [CacheModule.register()],
  providers: [StoreSettingService, StoreSettingRepository],
  controllers: [StoreSettingController],
})
export class StoreSettingModule {}
