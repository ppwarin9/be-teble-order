import { Public } from '@/common/decorators/public.decorator';
import { MenuCategoryResponseDto } from '@/menu-category/dto/menu-category-response.dto';
import { MenuCategoryService } from '@/menu-category/menu-category.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Customer - Menu Category')
@Public()
@Controller('liff/menu-categories')
export class CustomerMenuCategoryController {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active menu categories' })
  @ApiOkResponse({
    description: 'List of active menu categories.',
    type: [MenuCategoryResponseDto],
  })
  async getAll(): Promise<MenuCategoryResponseDto[]> {
    const categories = await this.menuCategoryService.getAllActive();
    return categories.map((category) => new MenuCategoryResponseDto(category));
  }
}
