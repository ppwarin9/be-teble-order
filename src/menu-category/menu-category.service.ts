import { MenuCategory } from '@/database/generated/prisma/client';
import { CreateMenuCategoryDto } from '@/menu-category/dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from '@/menu-category/dto/update-menu-category.dto';
import { MenuCategoryRepository } from '@/menu-category/menu-category.repository';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class MenuCategoryService {
  constructor(private readonly repository: MenuCategoryRepository) {}

  async create(dto: CreateMenuCategoryDto): Promise<MenuCategory> {
    const existingCategory = await this.repository.findByName(dto.name);

    if (existingCategory) {
      throw new ConflictException(
        `Menu category name '${dto.name}' already exists`,
      );
    }
    return this.repository.create({
      ...dto,
    });
  }

  async getAll(): Promise<MenuCategory[]> {
    return this.repository.getAll();
  }

  async getAllActive(): Promise<MenuCategory[]> {
    return this.repository.getAllActive();
  }

  async getById(id: string): Promise<MenuCategory> {
    return this.findByIdOrThrow(id);
  }

  async update(id: string, dto: UpdateMenuCategoryDto): Promise<MenuCategory> {
    await this.findByIdOrThrow(id);

    if (dto.name) {
      const existingCategory = await this.repository.findByName(dto.name);
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(
          `Menu category name '${dto.name}' already exists`,
        );
      }
    }
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findByIdOrThrow(id);

    const hasMenuItem = await this.repository.hasMenuItems(id);
    if (hasMenuItem) {
      throw new ConflictException(
        'Cannot delete this menu category because it still has menu items',
      );
    }
    await this.repository.softDelete(id);
  }

  private async findByIdOrThrow(id: string): Promise<MenuCategory> {
    const menuCategory = await this.repository.getById(id);
    if (!menuCategory) {
      throw new NotFoundException('Menu category not found');
    }

    return menuCategory;
  }
}
