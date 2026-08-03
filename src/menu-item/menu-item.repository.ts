import { MenuItem, Prisma } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import {
  MenuItemRepositoryInterface,
  MenuItemWithCategory,
} from '@/menu-item/menu-item.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuItemRepository extends MenuItemRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(
    data: Prisma.MenuItemCreateInput | Prisma.MenuItemUncheckedCreateInput,
  ): Promise<MenuItem> {
    return this.prisma.menuItem.create({
      data,
    });
  }

  async getAll(): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string): Promise<MenuItemWithCategory | null> {
    return this.prisma.menuItem.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
      },
    });
  }

  async getAllForCustomer(categoryId?: string): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({
      where: {
        deletedAt: null,
        category: { isActive: true },
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByIdForCustomer(id: string): Promise<MenuItemWithCategory | null> {
    return this.prisma.menuItem.findFirst({
      where: { id, deletedAt: null, category: { isActive: true } },
      include: { category: true },
    });
  }

  async update(
    id: string,
    data: Prisma.MenuItemUpdateInput | Prisma.MenuItemUncheckedUpdateInput,
  ): Promise<MenuItem> {
    return this.prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<MenuItem> {
    return this.prisma.menuItem.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findByName(name: string): Promise<MenuItem | null> {
    return this.prisma.menuItem.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async hasActiveTransactions(menuItemId: string): Promise<boolean> {
    const [cartItem, orderItem] = await Promise.all([
      this.prisma.cartItem.findFirst({ where: { menuItemId } }),
      this.prisma.orderItem.findFirst({
        where: { menuItemId, status: { not: 'SERVED' } },
      }),
    ]);
    return !!cartItem || !!orderItem;
  }
}
