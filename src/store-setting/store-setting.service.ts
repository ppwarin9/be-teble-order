import { StoreSetting } from '@/database/generated/prisma/client';
import { StoreSettingResponseDto } from '@/store-setting/dto/store-setting-response.dto';
import { UpdateStoreSettingDto } from '@/store-setting/dto/update-store-setting.dto';
import { StoreSettingRepository } from '@/store-setting/store-setting.repository';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class StoreSettingService {
  private readonly CACHE_KEY = 'STORE_SETTING_CACHE';

  constructor(
    private readonly repository: StoreSettingRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private toResponseDto(setting: StoreSetting): StoreSettingResponseDto {
    return plainToInstance(StoreSettingResponseDto, setting, {
      excludeExtraneousValues: true,
    });
  }

  async get(): Promise<StoreSettingResponseDto> {
    const cacheData = await this.cacheManager.get<StoreSetting>(this.CACHE_KEY);
    if (cacheData) {
      return this.toResponseDto(cacheData);
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

    return this.toResponseDto(setting);
  }

  async update(dto: UpdateStoreSettingDto): Promise<StoreSettingResponseDto> {
    const currentSetting = await this.get();

    const updatedSetting = await this.repository.update(currentSetting.id, dto);

    await this.cacheManager.set(this.CACHE_KEY, updatedSetting);

    return this.toResponseDto(updatedSetting);
  }
}
