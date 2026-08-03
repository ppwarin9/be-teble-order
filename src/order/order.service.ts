import { AuthenticatedSessionMember } from '@/auth/types/session.type';
import { CartService } from '@/cart/cart.service';
import { OrderItem, Prisma } from '@/database/generated/prisma/client';
import { OrderItemStatus } from '@/database/generated/prisma/enums';
import {
  NewOrderItemInput,
  OrderItemWithContext,
  OrderRepositoryInterface,
  OrderRoundWithItems,
} from '@/order/order.repository.interface';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

const STATUS_ORDER: OrderItemStatus[] = ['PENDING', 'COOKING', 'SERVED'];
const DEFAULT_QUEUE_STATUSES: OrderItemStatus[] = ['PENDING', 'COOKING'];
const MAX_ROUND_NUMBER_RETRIES = 3;

@Injectable()
export class OrderService {
  constructor(
    private readonly repository: OrderRepositoryInterface,
    private readonly cartService: CartService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async submitCart(
    sessionMember: AuthenticatedSessionMember,
  ): Promise<OrderRoundWithItems> {
    const cart = await this.cartService.getCurrentCart(sessionMember);

    if (cart.cartItems.length === 0) {
      throw new BadRequestException('Cannot submit an empty cart');
    }

    const items: NewOrderItemInput[] = cart.cartItems.map((cartItem) => ({
      menuItemId: cartItem.menuItemId,
      addedBy: cartItem.addedBy,
      quantity: cartItem.quantity,
      unitPriceSnapshot: cartItem.menuItem.price,
      nameSnapshot: cartItem.menuItem.name,
      note: cartItem.note,
      estimatedMinutes: cartItem.menuItem.estimatedCookingMinutes,
    }));

    const round = await this.createRoundWithRetry(
      sessionMember.tableSessionId,
      items,
    );

    await this.cartService.clearCart(cart.id, sessionMember.tableSessionId);

    this.realtimeGateway.emitToTableSession(
      sessionMember.tableSessionId,
      'round:submitted',
      { roundId: round.id },
    );
    this.realtimeGateway.emitToAdmin('round:submitted', { roundId: round.id });

    return round;
  }

  async getRoundsForSession(
    sessionMember: AuthenticatedSessionMember,
  ): Promise<OrderRoundWithItems[]> {
    return this.repository.getRoundsByTableSessionId(
      sessionMember.tableSessionId,
    );
  }

  async getQueue(
    statuses?: OrderItemStatus[],
  ): Promise<OrderItemWithContext[]> {
    return this.repository.getQueue(statuses ?? DEFAULT_QUEUE_STATUSES);
  }

  async updateItemStatus(
    id: string,
    nextStatus: OrderItemStatus,
  ): Promise<OrderItem> {
    const item = await this.findByIdOrThrow(id);

    const currentIndex = STATUS_ORDER.indexOf(item.status);
    const nextIndex = STATUS_ORDER.indexOf(nextStatus);
    if (nextIndex !== currentIndex + 1) {
      throw new BadRequestException(
        `Cannot transition order item from ${item.status} to ${nextStatus}`,
      );
    }

    const updated = await this.repository.updateStatus(id, {
      status: nextStatus,
      ...(nextStatus === 'COOKING' && { startedAt: new Date() }),
    });

    const tableSessionId = item.orderRound.tableSessionId;
    this.realtimeGateway.emitToTableSession(
      tableSessionId,
      'order_item:updated',
      { orderItemId: id, status: nextStatus },
    );
    this.realtimeGateway.emitToAdmin('order_item:updated', {
      orderItemId: id,
      status: nextStatus,
    });

    return updated;
  }

  private async findByIdOrThrow(id: string): Promise<OrderItemWithContext> {
    const item = await this.repository.getOrderItemById(id);
    if (!item) {
      throw new NotFoundException('Order item not found');
    }
    return item;
  }

  // getNextRoundNumber + createRoundWithItems isn't atomic — two concurrent
  // submits for the same table can both read the same count before either
  // writes. The insert itself is protected by a unique constraint, so on that
  // race lose (P2002) we just re-read the count and try again, mirroring
  // TableSessionRepository.findOrCreateOpenSession's identical race handling.
  private async createRoundWithRetry(
    tableSessionId: string,
    items: NewOrderItemInput[],
    attempt = 0,
  ): Promise<OrderRoundWithItems> {
    const roundNumber =
      await this.repository.getNextRoundNumber(tableSessionId);
    try {
      return await this.repository.createRoundWithItems(
        tableSessionId,
        roundNumber,
        items,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        attempt < MAX_ROUND_NUMBER_RETRIES
      ) {
        return this.createRoundWithRetry(tableSessionId, items, attempt + 1);
      }
      throw error;
    }
  }
}
