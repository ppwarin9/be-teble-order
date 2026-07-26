import { MenuItem, Prisma } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuItemRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async getById(id: string) {
    return this.prisma.menuItem.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
      },
    });
  }

  async getByCategoryId(categoryId: string): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({
      where: { categoryId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
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

  // async isInUse(id: string): Promise<boolean> {
  //   const [cartItem, orderItem] = await Promise.all([
  //     this.prisma.cartItem.findFirst({ where: { menuItemId: id } }),
  //     this.prisma.orderItem.findFirst({ where: { menuItemId: id } }),
  //   ]);
  //   return !!cartItem || !!orderItem;
  // }
}
