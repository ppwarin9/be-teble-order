import { MenuCategory, Prisma } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MenuCategoryCreateInput): Promise<MenuCategory> {
    return this.prisma.menuCategory.create({
      data,
    });
  }

  async getAll(): Promise<MenuCategory[]> {
    return this.prisma.menuCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getAllActive(): Promise<MenuCategory[]> {
    return this.prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getById(id: string): Promise<MenuCategory | null> {
    return this.prisma.menuCategory.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.MenuCategoryUpdateInput,
  ): Promise<MenuCategory> {
    return this.prisma.menuCategory.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<MenuCategory> {
    return this.prisma.menuCategory.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async hasMenuItems(categoryId: string): Promise<boolean> {
    const menuItem = await this.prisma.menuItem.findFirst({
      where: { categoryId, deletedAt: null },
    });
    return !!menuItem;
  }

  async findByName(name: string): Promise<MenuCategory | null> {
    return this.prisma.menuCategory.findFirst({
      where: { name },
    });
  }
}
