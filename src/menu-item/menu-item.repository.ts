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

  async getById(id: string): Promise<MenuItem | null> {
    return this.prisma.menuItem.findFirst({
      where: { id, deletedAt: null },
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
}
