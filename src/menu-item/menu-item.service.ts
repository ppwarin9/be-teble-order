import { MenuItem } from '@/database/generated/prisma/client';
import { MenuCategoryService } from '@/menu-category/menu-category.service';
import { CreateMenuItemDto } from '@/menu-item/dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '@/menu-item/dto/update-menu-item.dto';
import { MenuItemRepository } from '@/menu-item/menu-item.repository';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class MenuItemService {
  constructor(
    private readonly repository: MenuItemRepository,
    private readonly menuCategoryService: MenuCategoryService,
  ) {}

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const existingMenuItem = await this.repository.findByName(dto.name);

    if (existingMenuItem) {
      throw new ConflictException(
        `Menu item name '${dto.name}' already exists`,
      );
    }

    await this.menuCategoryService.getById(dto.categoryId);

    return this.repository.create({
      ...dto,
    });
  }

  async getAll(): Promise<MenuItem[]> {
    return this.repository.getAll();
  }

  async getAllForCustomer(): Promise<MenuItem[]> {
    return this.repository.getAllForCustomer();
  }

  async getById(id: string): Promise<MenuItem> {
    return this.findByIdOrThrow(id);
  }

  async getByIdForCustomer(id: string): Promise<MenuItem> {
    const menuItem = await this.repository.getByIdForCustomer(id);
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }
    return menuItem;
  }

  async update(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    await this.findByIdOrThrow(id);

    if (dto.name) {
      const existingMenuItem = await this.repository.findByName(dto.name);
      if (existingMenuItem && existingMenuItem.id !== id) {
        throw new ConflictException(
          `Menu item name '${dto.name}' already exists`,
        );
      }
    }
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findByIdOrThrow(id);

    const hasActiveTransactions =
      await this.repository.hasActiveTransactions(id);
    if (hasActiveTransactions) {
      throw new ConflictException(
        'Cannot delete this menu item because it is referenced by an active cart or an in-progress order',
      );
    }

    await this.repository.softDelete(id);
  }

  private async findByIdOrThrow(id: string): Promise<MenuItem> {
    const menuItem = await this.repository.getById(id);

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }
    return menuItem;
  }
}
