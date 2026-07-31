import {
  ActiveSessionRow,
  DashboardRepositoryInterface,
} from '@/dashboard/dashboard.repository.interface';
import { Injectable } from '@nestjs/common';

export type DailySales = {
  date: string;
  totalSales: number;
  billCount: number;
  orderCount: number;
};

@Injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepositoryInterface) {}

  async getDailySales(dateInput?: string): Promise<DailySales> {
    const date = dateInput ? new Date(dateInput) : new Date();
    const start = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const [{ totalSales, billCount }, orderCount] = await Promise.all([
      this.repository.getDailySales(start, end),
      this.repository.getOrderCount(start, end),
    ]);

    return {
      date: start.toISOString().slice(0, 10),
      totalSales,
      billCount,
      orderCount,
    };
  }

  async getActiveSessions(): Promise<ActiveSessionRow[]> {
    return this.repository.getActiveSessions();
  }
}
