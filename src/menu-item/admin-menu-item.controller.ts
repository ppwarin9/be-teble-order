import { Roles } from '@/common/decorators/roles.decorator';
import { CreateMenuItemDto } from '@/menu-item/dto/create-menu-item.dto';
import { MenuItemResponseDto } from '@/menu-item/dto/menu-item-response.dto';
import { UpdateMenuItemDto } from '@/menu-item/dto/update-menu-item.dto';
import { MenuItemService } from '@/menu-item/menu-item.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin - Menu Item')
@ApiBearerAuth()
@Controller('admin/menu-items')
export class AdminMenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiCreatedResponse({
    description: 'Menu item created successfully.',
    type: MenuItemResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiConflictResponse({ description: 'Menu item name already exists.' })
  async create(@Body() dto: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    const menuItem = await this.menuItemService.create(dto);
    return new MenuItemResponseDto(menuItem);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiOkResponse({
    description: 'List of menu items.',
    type: [MenuItemResponseDto],
  })
  async getAll(): Promise<MenuItemResponseDto[]> {
    const menuItems = await this.menuItemService.getAll();
    return menuItems.map((menuItem) => new MenuItemResponseDto(menuItem));
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get a menu item by id' })
  @ApiOkResponse({
    description: 'Menu item found.',
    type: MenuItemResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Menu item not found.' })
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MenuItemResponseDto> {
    const menuItem = await this.menuItemService.getById(id);
    return new MenuItemResponseDto(menuItem);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a menu item' })
  @ApiOkResponse({
    description: 'Menu item updated.',
    type: MenuItemResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Menu item not found.' })
  @ApiConflictResponse({ description: 'Menu item name already exists.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    const menuItem = await this.menuItemService.update(id, dto);
    return new MenuItemResponseDto(menuItem);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a menu item' })
  @ApiNoContentResponse({ description: 'Menu item soft-deleted.' })
  @ApiNotFoundResponse({ description: 'Menu item not found.' })
  @ApiConflictResponse({
    description:
      'Cannot delete this menu item because it is referenced by an active cart or an in-progress order.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.menuItemService.remove(id);
  }
}
