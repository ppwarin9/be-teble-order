import { Public } from '@/common/decorators/public.decorator';
import { MenuItemResponseDto } from '@/menu-item/dto/menu-item-response.dto';
import { MenuItemService } from '@/menu-item/menu-item.service';
import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Customer - Menu Item')
@Public()
@Controller('liff/menu-items')
export class CustomerMenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all browsable menu items',
    description:
      'Only items whose category is active and which have not been deleted are returned. Items with isAvailable: false are still included so the client can display them as sold out.',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter to a single category id.',
  })
  @ApiOkResponse({
    description: 'List of menu items.',
    type: [MenuItemResponseDto],
  })
  async getAll(
    @Query('categoryId') categoryId?: string,
  ): Promise<MenuItemResponseDto[]> {
    const menuItems = await this.menuItemService.getAllForCustomer(categoryId);
    return menuItems.map((menuItem) => new MenuItemResponseDto(menuItem));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by id' })
  @ApiOkResponse({
    description: 'Menu item found.',
    type: MenuItemResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Menu item not found.' })
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MenuItemResponseDto> {
    const menuItem = await this.menuItemService.getByIdForCustomer(id);
    return new MenuItemResponseDto(menuItem);
  }
}
