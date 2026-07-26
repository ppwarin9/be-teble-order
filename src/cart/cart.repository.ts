import {
  Cart,
  CartItem,
  MenuItem,
  Prisma,
} from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

export type CartItemWithMenuItem = CartItem & { menuItem: MenuItem };
export type CartWithItems = Cart & { cartItems: CartItemWithMenuItem[] };
export type CartItemWithCart = CartItem & { cart: Cart };

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTableSessionId(
    tableSessionId: string,
  ): Promise<CartWithItems | null> {
    return this.prisma.cart.findUnique({
      where: { tableSessionId },
      include: { cartItems: { include: { menuItem: true } } },
    });
  }

  async create(tableSessionId: string): Promise<Cart> {
    return this.prisma.cart.create({ data: { tableSessionId } });
  }

  async findCartItemById(id: string): Promise<CartItemWithCart | null> {
    return this.prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });
  }

  async createCartItem(
    data: Prisma.CartItemUncheckedCreateInput,
  ): Promise<CartItemWithMenuItem> {
    return this.prisma.cartItem.create({
      data,
      include: { menuItem: true },
    });
  }

  async updateCartItem(
    id: string,
    data: Prisma.CartItemUncheckedUpdateInput,
  ): Promise<CartItemWithMenuItem> {
    return this.prisma.cartItem.update({
      where: { id },
      data,
      include: { menuItem: true },
    });
  }

  async deleteCartItem(id: string): Promise<CartItem> {
    return this.prisma.cartItem.delete({ where: { id } });
  }

  async deleteAllCartItems(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
  }
}
