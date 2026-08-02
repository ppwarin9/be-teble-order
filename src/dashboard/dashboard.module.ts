import { DashboardController } from '@/dashboard/dashboard.controller';
import { DashboardRepository } from '@/dashboard/dashboard.repository';
import { DashboardRepositoryInterface } from '@/dashboard/dashboard.repository.interface';
import { DashboardService } from '@/dashboard/dashboard.service';
import { StoreSettingModule } from '@/store-setting/store-setting.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [StoreSettingModule],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    { provide: DashboardRepositoryInterface, useClass: DashboardRepository },
  ],
})
export class DashboardModule {}
