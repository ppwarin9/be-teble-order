import { AuthenticatedSessionMember } from '@/auth/types/session.type';
import {
  CartItemWithMenuItem,
  CartRepositoryInterface,
  CartWithItems,
} from '@/cart/cart.repository.interface';
import { AddCartItemDto } from '@/cart/dto/add-cart-item.dto';
import { UpdateCartItemDto } from '@/cart/dto/update-cart-item.dto';
import { MenuItemService } from '@/menu-item/menu-item.service';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CartService {
  constructor(
    private readonly repository: CartRepositoryInterface,
    private readonly menuItemService: MenuItemService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async getCurrentCart(
    sessionMember: AuthenticatedSessionMember,
  ): Promise<CartWithItems> {
    return this.getOrCreateCart(sessionMember.tableSessionId);
  }

  async addItem(
    sessionMember: AuthenticatedSessionMember,
    dto: AddCartItemDto,
  ): Promise<CartItemWithMenuItem> {
    const menuItem = await this.menuItemService.getById(dto.menuItemId);
    if (!menuItem.isAvailable) {
      throw new ConflictException('This menu item is currently unavailable');
    }

    const cart = await this.getOrCreateCart(sessionMember.tableSessionId);

    const item = await this.repository.createCartItem({
      cartId: cart.id,
      menuItemId: dto.menuItemId,
      addedBy: sessionMember.id,
      quantity: dto.quantity,
      note: dto.note ?? '',
    });
    this.realtimeGateway.emitToTableSession(
      sessionMember.tableSessionId,
      'cart:updated',
      { cartItemId: item.id },
    );
    return item;
  }

  async updateItem(
    sessionMember: AuthenticatedSessionMember,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartItemWithMenuItem> {
    await this.findCartItemInSessionOrThrow(sessionMember, cartItemId);

    const updated = await this.repository.updateCartItem(cartItemId, {
      ...(dto.quantity !== undefined && { quantity: dto.quantity }),
      ...(dto.note !== undefined && { note: dto.note }),
    });
    this.realtimeGateway.emitToTableSession(
      sessionMember.tableSessionId,
      'cart:updated',
      { cartItemId },
    );
    return updated;
  }

  async removeItem(
    sessionMember: AuthenticatedSessionMember,
    cartItemId: string,
  ): Promise<void> {
    await this.findCartItemInSessionOrThrow(sessionMember, cartItemId);
    await this.repository.deleteCartItem(cartItemId);
    this.realtimeGateway.emitToTableSession(
      sessionMember.tableSessionId,
      'cart:updated',
      { cartItemId },
    );
  }

  async clearCart(cartId: string): Promise<void> {
    await this.repository.deleteAllCartItems(cartId);
  }

  private async getOrCreateCart(
    tableSessionId: string,
  ): Promise<CartWithItems> {
    const existing = await this.repository.findByTableSessionId(tableSessionId);
    if (existing) {
      return existing;
    }

    await this.repository.create(tableSessionId);
    const created = await this.repository.findByTableSessionId(tableSessionId);
    if (!created) {
      throw new NotFoundException('Cart not found');
    }
    return created;
  }

  private async findCartItemInSessionOrThrow(
    sessionMember: AuthenticatedSessionMember,
    cartItemId: string,
  ) {
    const item = await this.repository.findCartItemById(cartItemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    if (item.cart.tableSessionId !== sessionMember.tableSessionId) {
      throw new ForbiddenException(
        'This cart item does not belong to your table session',
      );
    }
    return item;
  }
}
