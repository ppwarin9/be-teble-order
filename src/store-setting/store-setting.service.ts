import { StoreSetting } from '@/database/generated/prisma/client';
import { UpdateStoreSettingDto } from '@/store-setting/dto/update-store-setting.dto';
import { StoreSettingRepositoryInterface } from '@/store-setting/store-setting.repository.interface';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class StoreSettingService {
  private readonly CACHE_KEY = 'STORE_SETTING_CACHE';

  constructor(
    private readonly repository: StoreSettingRepositoryInterface,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async get(): Promise<StoreSetting> {
    const cacheData = await this.cacheManager.get<StoreSetting>(this.CACHE_KEY);
    if (cacheData) {
      return cacheData;
    }

    let setting = await this.repository.getSingleton();

    if (!setting) {
      setting = await this.repository.create({
        enableVat: true,
        vatRate: 0.07,
        enableServiceCharge: false,
        serviceChargeRate: 0.1,
        currency: 'THB',
        timezone: 'Asia/Bangkok',
        defaultSplitMethod: 'SINGLE_PAYER',
      });
    }
    await this.cacheManager.set(this.CACHE_KEY, setting);

    return setting;
  }

  async update(dto: UpdateStoreSettingDto): Promise<StoreSetting> {
    const currentSetting = await this.get();

    const updatedSetting = await this.repository.update(currentSetting.id, dto);

    await this.cacheManager.set(this.CACHE_KEY, updatedSetting);

    return updatedSetting;
  }
}
