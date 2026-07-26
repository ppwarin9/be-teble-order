import { Module } from '@nestjs/common';
import { MenuItemService } from './menu-item.service';
import { MenuItemController } from './menu-item.controller';
import { MenuItemRepository } from '@/menu-item/menu-item.repository';
import { MenuCategoryModule } from '@/menu-category/menu-category.module';

@Module({
  imports: [MenuCategoryModule],
  controllers: [MenuItemController],
  providers: [MenuItemService, MenuItemRepository],
})
export class MenuItemModule {}
