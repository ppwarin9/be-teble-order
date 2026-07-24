import { StoreSetting } from '@/database/generated/prisma/client';
import { StoreSettingRepository } from '@/store-setting/store-setting.repository';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class StoreSettingService {
  private readonly CACHE_KEY = 'STORE_SETTING_CACHE';

  constructor(
    private readonly repository: StoreSettingRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async get(): Promise<StoreSetting> {
    const cacheData = await this.cacheManager.get<StoreSetting>(this.CACHE_KEY);
    if (cacheData) {
      return cacheData;
    }

    let setting = await this.repository.findSingleton();

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
}
