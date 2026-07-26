import { AuthenticatedSessionMember } from '@/auth/types/session.type';
import { CartService } from '@/cart/cart.service';
import { OrderItem } from '@/database/generated/prisma/client';
import { OrderItemStatus } from '@/database/generated/prisma/enums';
import {
  NewOrderItemInput,
  OrderItemWithContext,
  OrderRepository,
  OrderRoundWithItems,
} from '@/order/order.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

const STATUS_ORDER: OrderItemStatus[] = ['PENDING', 'COOKING', 'SERVED'];
const DEFAULT_QUEUE_STATUSES: OrderItemStatus[] = ['PENDING', 'COOKING'];

@Injectable()
export class OrderService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly cartService: CartService,
  ) {}

  async submitCart(
    sessionMember: AuthenticatedSessionMember,
  ): Promise<OrderRoundWithItems> {
    const cart = await this.cartService.getCurrentCart(sessionMember);

    if (cart.cartItems.length === 0) {
      throw new BadRequestException('Cannot submit an empty cart');
    }

    const roundNumber = await this.repository.getNextRoundNumber(
      sessionMember.tableSessionId,
    );

    const items: NewOrderItemInput[] = cart.cartItems.map((cartItem) => ({
      menuItemId: cartItem.menuItemId,
      addedBy: cartItem.addedBy,
      quantity: cartItem.quantity,
      unitPriceSnapshot: cartItem.menuItem.price,
      nameSnapshot: cartItem.menuItem.name,
      note: cartItem.note,
      estimatedMinutes: cartItem.menuItem.estimatedCookingMinutes,
    }));

    const round = await this.repository.createRoundWithItems(
      sessionMember.tableSessionId,
      roundNumber,
      items,
    );

    await this.cartService.clearCart(cart.id);

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

    return this.repository.updateStatus(id, {
      status: nextStatus,
      ...(nextStatus === 'COOKING' && { startedAt: new Date() }),
    });
  }

  private async findByIdOrThrow(id: string): Promise<OrderItem> {
    const item = await this.repository.getOrderItemById(id);
    if (!item) {
      throw new NotFoundException('Order item not found');
    }
    return item;
  }
}
