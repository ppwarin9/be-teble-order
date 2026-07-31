import { DashboardController } from '@/dashboard/dashboard.controller';
import { DashboardRepository } from '@/dashboard/dashboard.repository';
import { DashboardRepositoryInterface } from '@/dashboard/dashboard.repository.interface';
import { DashboardService } from '@/dashboard/dashboard.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [DashboardController],
  providers: [
    DashboardService,
    { provide: DashboardRepositoryInterface, useClass: DashboardRepository },
  ],
})
export class DashboardModule {}
