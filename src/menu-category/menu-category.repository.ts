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
}
