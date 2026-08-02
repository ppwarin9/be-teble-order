import {
  MenuCategory,
  MenuItem,
  Prisma,
} from '@/database/generated/prisma/client';

export type MenuItemWithCategory = MenuItem & { category: MenuCategory };

export abstract class MenuItemRepositoryInterface {
  abstract create(
    data: Prisma.MenuItemCreateInput | Prisma.MenuItemUncheckedCreateInput,
  ): Promise<MenuItem>;

  abstract getAll(): Promise<MenuItem[]>;

  abstract getById(id: string): Promise<MenuItemWithCategory | null>;

  abstract getByCategoryId(categoryId: string): Promise<MenuItem[]>;

  abstract getAllForCustomer(categoryId?: string): Promise<MenuItem[]>;

  abstract getByIdForCustomer(id: string): Promise<MenuItemWithCategory | null>;

  abstract update(
    id: string,
    data: Prisma.MenuItemUpdateInput | Prisma.MenuItemUncheckedUpdateInput,
  ): Promise<MenuItem>;

  abstract softDelete(id: string): Promise<MenuItem>;

  abstract findByName(name: string): Promise<MenuItem | null>;

  abstract hasActiveTransactions(menuItemId: string): Promise<boolean>;
}
