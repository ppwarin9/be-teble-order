import {
  Cart,
  CartItem,
  MenuItem,
  Prisma,
} from '@/database/generated/prisma/client';

export type CartItemWithMenuItem = CartItem & { menuItem: MenuItem };
export type CartWithItems = Cart & { cartItems: CartItemWithMenuItem[] };
export type CartItemWithCart = CartItem & { cart: Cart };

export abstract class CartRepositoryInterface {
  abstract findByTableSessionId(
    tableSessionId: string,
  ): Promise<CartWithItems | null>;

  abstract create(tableSessionId: string): Promise<Cart>;

  abstract findCartItemById(id: string): Promise<CartItemWithCart | null>;

  abstract createCartItem(
    data: Prisma.CartItemUncheckedCreateInput,
  ): Promise<CartItemWithMenuItem>;

  abstract updateCartItem(
    id: string,
    data: Prisma.CartItemUncheckedUpdateInput,
  ): Promise<CartItemWithMenuItem>;

  abstract deleteCartItem(id: string): Promise<CartItem>;

  abstract deleteAllCartItems(cartId: string): Promise<void>;
}
