import {
  ActiveSessionRow,
  DashboardRepositoryInterface,
} from '@/dashboard/dashboard.repository.interface';
import { StoreSettingService } from '@/store-setting/store-setting.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { addDays } from 'date-fns';
import { format, fromZonedTime, toZonedTime } from 'date-fns-tz';

export type DailySales = {
  date: string;
  totalSales: number;
  billCount: number;
  orderCount: number;
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly repository: DashboardRepositoryInterface,
    private readonly storeSettingService: StoreSettingService,
  ) {}

  async getDailySales(dateInput?: string): Promise<DailySales> {
    const { timezone } = await this.storeSettingService.get();

    const referenceDate = dateInput ? new Date(dateInput) : new Date();
    if (Number.isNaN(referenceDate.getTime())) {
      throw new BadRequestException('Invalid date, expected format YYYY-MM-DD');
    }
    const zonedReference = toZonedTime(referenceDate, timezone);
    // Calendar date (Y/M/D) as observed in the store's timezone, not UTC or server-local.
    const localDateOnly = new Date(
      Date.UTC(
        zonedReference.getUTCFullYear(),
        zonedReference.getUTCMonth(),
        zonedReference.getUTCDate(),
      ),
    );
    const localDateStr = format(localDateOnly, 'yyyy-MM-dd', {
      timeZone: 'UTC',
    });
    const nextLocalDateStr = format(addDays(localDateOnly, 1), 'yyyy-MM-dd', {
      timeZone: 'UTC',
    });

    const start = fromZonedTime(`${localDateStr}T00:00:00`, timezone);
    const end = fromZonedTime(`${nextLocalDateStr}T00:00:00`, timezone);

    const [{ totalSales, billCount }, orderCount] = await Promise.all([
      this.repository.getDailySales(start, end),
      this.repository.getOrderCount(start, end),
    ]);

    return {
      date: localDateStr,
      totalSales,
      billCount,
      orderCount,
    };
  }

  async getActiveSessions(): Promise<ActiveSessionRow[]> {
    return this.repository.getActiveSessions();
  }
}
