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
        `รายการชื่อ '${dto.name}' มีอยู่ในระบบแล้วครับ`,
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

  async getById(id: string): Promise<MenuItem> {
    const menuItem = await this.repository.getById(id);

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }
    return menuItem;
  }

  async update(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    await this.getById(id);

    if (dto.name) {
      const existingMenuItem = await this.repository.findByName(dto.name);
      if (existingMenuItem && existingMenuItem.id !== id) {
        throw new ConflictException(
          `รายการชื่อ '${dto.name}' มีอยู่ในระบบแล้วครับ`,
        );
      }
    }
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);

    // TODO: เช็ค hasActiveTransactions ป้องกันการลบเมนูที่กำลังมีคนสั่ง

    await this.repository.softDelete(id);
  }
}
