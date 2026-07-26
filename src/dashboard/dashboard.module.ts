import { DashboardController } from '@/dashboard/dashboard.controller';
import { DashboardRepository } from '@/dashboard/dashboard.repository';
import { DashboardService } from '@/dashboard/dashboard.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
