export type ActiveSessionRow = {
  tableSessionId: string;
  diningTableId: string;
  tableNumber: string;
  openedAt: Date;
  memberCount: number;
  pendingItemCount: number;
};

export abstract class DashboardRepositoryInterface {
  abstract getDailySales(
    start: Date,
    end: Date,
  ): Promise<{ totalSales: number; billCount: number }>;

  abstract getOrderCount(start: Date, end: Date): Promise<number>;

  abstract getActiveSessions(): Promise<ActiveSessionRow[]>;
}
