import { Module } from '@nestjs/common';
import { MenuCategoryService } from './menu-category.service';
import { AdminMenuCategoryController } from '@/menu-category/admin-menu-category.controller';
import { CustomerMenuCategoryController } from '@/menu-category/customer-menu-category.controller';
import { MenuCategoryRepository } from '@/menu-category/menu-category.repository';
import { MenuCategoryRepositoryInterface } from '@/menu-category/menu-category.repository.interface';

@Module({
  controllers: [AdminMenuCategoryController, CustomerMenuCategoryController],
  providers: [
    MenuCategoryService,
    {
      provide: MenuCategoryRepositoryInterface,
      useClass: MenuCategoryRepository,
    },
  ],
  exports: [MenuCategoryRepositoryInterface, MenuCategoryService],
})
export class MenuCategoryModule {}
