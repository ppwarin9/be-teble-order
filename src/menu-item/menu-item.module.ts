import { Module } from '@nestjs/common';
import { MenuItemService } from './menu-item.service';
import { AdminMenuItemController } from '@/menu-item/admin-menu-item.controller';
import { CustomerMenuItemController } from '@/menu-item/customer-menu-item.controller';
import { MenuItemRepository } from '@/menu-item/menu-item.repository';
import { MenuItemRepositoryInterface } from '@/menu-item/menu-item.repository.interface';
import { MenuCategoryModule } from '@/menu-category/menu-category.module';

@Module({
  imports: [MenuCategoryModule],
  controllers: [AdminMenuItemController, CustomerMenuItemController],
  providers: [
    MenuItemService,
    { provide: MenuItemRepositoryInterface, useClass: MenuItemRepository },
  ],
  exports: [MenuItemService, MenuItemRepositoryInterface],
})
export class MenuItemModule {}
