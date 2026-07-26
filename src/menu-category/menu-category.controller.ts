import { Controller } from '@nestjs/common';
import { MenuCategoryService } from './menu-category.service';

@Controller('menu-category')
export class MenuCategoryController {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}
}
