import { Roles } from '@/common/decorators/roles.decorator';
import { CreateMenuCategoryDto } from '@/menu-category/dto/create-menu-category.dto';
import { MenuCategoryResponseDto } from '@/menu-category/dto/menu-category-response.dto';
import { UpdateMenuCategoryDto } from '@/menu-category/dto/update-menu-category.dto';
import { MenuCategoryService } from '@/menu-category/menu-category.service';
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

@ApiTags('Admin - Menu Category')
@ApiBearerAuth()
@Controller('admin/menu-categories')
export class AdminMenuCategoryController {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new menu category' })
  @ApiCreatedResponse({
    description: 'Menu category created successfully.',
    type: MenuCategoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiConflictResponse({ description: 'Menu category name already exists.' })
  async create(
    @Body() dto: CreateMenuCategoryDto,
  ): Promise<MenuCategoryResponseDto> {
    const category = await this.menuCategoryService.create(dto);
    return new MenuCategoryResponseDto(category);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all menu categories (active and inactive)' })
  @ApiOkResponse({
    description: 'List of menu categories.',
    type: [MenuCategoryResponseDto],
  })
  async getAll(): Promise<MenuCategoryResponseDto[]> {
    const categories = await this.menuCategoryService.getAll();
    return categories.map((category) => new MenuCategoryResponseDto(category));
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get a menu category by id' })
  @ApiOkResponse({
    description: 'Menu category found.',
    type: MenuCategoryResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Menu category not found.' })
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MenuCategoryResponseDto> {
    const category = await this.menuCategoryService.getById(id);
    return new MenuCategoryResponseDto(category);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a menu category' })
  @ApiOkResponse({
    description: 'Menu category updated.',
    type: MenuCategoryResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Menu category not found.' })
  @ApiConflictResponse({ description: 'Menu category name already exists.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMenuCategoryDto,
  ): Promise<MenuCategoryResponseDto> {
    const category = await this.menuCategoryService.update(id, dto);
    return new MenuCategoryResponseDto(category);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a menu category' })
  @ApiNoContentResponse({ description: 'Menu category soft-deleted.' })
  @ApiNotFoundResponse({ description: 'Menu category not found.' })
  @ApiConflictResponse({
    description:
      'Cannot delete this menu category because it still has menu items.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.menuCategoryService.remove(id);
  }
}
