import {
  DiningTable,
  OrderItem,
  OrderRound,
  Prisma,
  TableSession,
} from '@/database/generated/prisma/client';
import { OrderItemStatus } from '@/database/generated/prisma/enums';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

export type OrderRoundWithItems = OrderRound & { orderItems: OrderItem[] };

export type OrderItemWithContext = OrderItem & {
  orderRound: OrderRound & {
    tableSession: TableSession & { diningTable: DiningTable };
  };
};

export type NewOrderItemInput = {
  menuItemId: string;
  addedBy: string;
  quantity: number;
  unitPriceSnapshot: number;
  nameSnapshot: string;
  note: string;
  estimatedMinutes: number;
};

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getNextRoundNumber(tableSessionId: string): Promise<number> {
    const count = await this.prisma.orderRound.count({
      where: { tableSessionId },
    });
    return count + 1;
  }

  async createRoundWithItems(
    tableSessionId: string,
    roundNumber: number,
    items: NewOrderItemInput[],
  ): Promise<OrderRoundWithItems> {
    return this.prisma.$transaction(async (tx) => {
      const round = await tx.orderRound.create({
        data: { tableSessionId, roundNumber },
      });

      await tx.orderItem.createMany({
        data: items.map((item) => ({
          ...item,
          orderRoundId: round.id,
        })),
      });

      const orderItems = await tx.orderItem.findMany({
        where: { orderRoundId: round.id },
      });

      return { ...round, orderItems };
    });
  }

  async getRoundsByTableSessionId(
    tableSessionId: string,
  ): Promise<OrderRoundWithItems[]> {
    return this.prisma.orderRound.findMany({
      where: { tableSessionId },
      include: { orderItems: true },
      orderBy: { roundNumber: 'asc' },
    });
  }

  async getQueue(
    statuses?: OrderItemStatus[],
  ): Promise<OrderItemWithContext[]> {
    return this.prisma.orderItem.findMany({
      where: statuses ? { status: { in: statuses } } : undefined,
      include: {
        orderRound: {
          include: { tableSession: { include: { diningTable: true } } },
        },
      },
      orderBy: { orderRound: { submittedAt: 'asc' } },
    });
  }

  async getOrderItemById(id: string): Promise<OrderItem | null> {
    return this.prisma.orderItem.findUnique({ where: { id } });
  }

  async updateStatus(
    id: string,
    data: Prisma.OrderItemUpdateInput,
  ): Promise<OrderItem> {
    return this.prisma.orderItem.update({ where: { id }, data });
  }
}
