import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { StoreSettingService } from './store-setting.service';
import { StoreSettingController } from './store-setting.controller';
import { StoreSettingRepository } from './store-setting.repository';
import { StoreSettingRepositoryInterface } from './store-setting.repository.interface';

@Module({
  imports: [CacheModule.register()],
  providers: [
    StoreSettingService,
    {
      provide: StoreSettingRepositoryInterface,
      useClass: StoreSettingRepository,
    },
  ],
  controllers: [StoreSettingController],
  exports: [StoreSettingService],
})
export class StoreSettingModule {}
