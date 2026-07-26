import { Module } from '@nestjs/common';
import { MenuCategoryService } from './menu-category.service';
import { AdminMenuCategoryController } from '@/menu-category/admin-menu-category.controller';
import { CustomerMenuCategoryController } from '@/menu-category/customer-menu-category.controller';
import { MenuCategoryRepository } from '@/menu-category/menu-category.repository';

@Module({
  controllers: [AdminMenuCategoryController, CustomerMenuCategoryController],
  providers: [MenuCategoryService, MenuCategoryRepository],
  exports: [MenuCategoryRepository, MenuCategoryService],
})
export class MenuCategoryModule {}
