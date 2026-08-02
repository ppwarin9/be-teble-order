import {
  DiningTable,
  OrderItem,
  OrderRound,
  Prisma,
  TableSession,
} from '@/database/generated/prisma/client';
import { OrderItemStatus } from '@/database/generated/prisma/enums';

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

export abstract class OrderRepositoryInterface {
  abstract getNextRoundNumber(tableSessionId: string): Promise<number>;

  abstract createRoundWithItems(
    tableSessionId: string,
    roundNumber: number,
    items: NewOrderItemInput[],
  ): Promise<OrderRoundWithItems>;

  abstract getRoundsByTableSessionId(
    tableSessionId: string,
  ): Promise<OrderRoundWithItems[]>;

  abstract getQueue(
    statuses?: OrderItemStatus[],
  ): Promise<OrderItemWithContext[]>;

  abstract getOrderItemById(id: string): Promise<OrderItemWithContext | null>;

  abstract updateStatus(
    id: string,
    data: Prisma.OrderItemUpdateInput,
  ): Promise<OrderItem>;
}
