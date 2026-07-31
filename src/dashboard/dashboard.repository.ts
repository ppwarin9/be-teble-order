import {
  ActiveSessionRow,
  DashboardRepositoryInterface,
} from '@/dashboard/dashboard.repository.interface';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardRepository extends DashboardRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getDailySales(
    start: Date,
    end: Date,
  ): Promise<{ totalSales: number; billCount: number }> {
    const result = await this.prisma.bill.aggregate({
      where: {
        status: 'SETTLED',
        settledAt: { gte: start, lt: end },
      },
      _sum: { grandTotal: true },
      _count: { _all: true },
    });

    return {
      totalSales: result._sum.grandTotal ?? 0,
      billCount: result._count._all,
    };
  }

  async getOrderCount(start: Date, end: Date): Promise<number> {
    return this.prisma.orderRound.count({
      where: { submittedAt: { gte: start, lt: end } },
    });
  }

  async getActiveSessions(): Promise<ActiveSessionRow[]> {
    const sessions = await this.prisma.tableSession.findMany({
      where: { status: 'OPEN' },
      include: {
        diningTable: true,
        sessionMembers: true,
        orderRounds: {
          include: {
            orderItems: { where: { status: { not: 'SERVED' } } },
          },
        },
      },
      orderBy: { openedAt: 'asc' },
    });

    return sessions.map((session) => ({
      tableSessionId: session.id,
      diningTableId: session.diningTableId,
      tableNumber: session.diningTable.tableNumber,
      openedAt: session.openedAt,
      memberCount: session.sessionMembers.length,
      pendingItemCount: session.orderRounds.reduce(
        (sum, round) => sum + round.orderItems.length,
        0,
      ),
    }));
  }
}
