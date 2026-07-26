import { Module } from '@nestjs/common';
import { MenuCategoryService } from './menu-category.service';
import { MenuCategoryController } from './menu-category.controller';
import { MenuCategoryRepository } from '@/menu-category/menu-category.repository';

@Module({
  controllers: [MenuCategoryController],
  providers: [MenuCategoryService, MenuCategoryRepository],
})
export class MenuCategoryModule {}
