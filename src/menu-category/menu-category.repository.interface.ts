import { MenuCategory, Prisma } from '@/database/generated/prisma/client';

export abstract class MenuCategoryRepositoryInterface {
  abstract create(data: Prisma.MenuCategoryCreateInput): Promise<MenuCategory>;

  abstract getAll(): Promise<MenuCategory[]>;

  abstract getAllActive(): Promise<MenuCategory[]>;

  abstract getById(id: string): Promise<MenuCategory | null>;

  abstract update(
    id: string,
    data: Prisma.MenuCategoryUpdateInput,
  ): Promise<MenuCategory>;

  abstract softDelete(id: string): Promise<MenuCategory>;

  abstract hasMenuItems(categoryId: string): Promise<boolean>;

  abstract findByName(name: string): Promise<MenuCategory | null>;
}
