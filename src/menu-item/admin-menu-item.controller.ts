import { Roles } from '@/common/decorators/roles.decorator';
import { CreateMenuItemDto } from '@/menu-item/dto/create-menu-item.dto';
import { MenuItemResponseDto } from '@/menu-item/dto/menu-item-response.dto';
import { UpdateMenuItemDto } from '@/menu-item/dto/update-menu-item.dto';
import { UploadMenuItemImageResponseDto } from '@/menu-item/dto/upload-menu-item-image-response.dto';
import { MenuItemService } from '@/menu-item/menu-item.service';
import { CloudinaryService } from '@/infrastructure/upload/cloudinary.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

@ApiTags('Admin - Menu Item')
@ApiBearerAuth()
@Controller('admin/menu-items')
export class AdminMenuItemController {
  constructor(
    private readonly menuItemService: MenuItemService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload-image')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({
    summary: 'Upload a menu item image to Cloudinary',
    description:
      'Returns the hosted image URL — call this first, then pass the returned imageUrl into create/update. Max 5MB, JPEG/PNG/WebP only.',
  })
  @ApiCreatedResponse({
    description: 'Image uploaded.',
    type: UploadMenuItemImageResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Missing file, wrong type, or too large.',
  })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ })
        .addMaxSizeValidator({ maxSize: MAX_IMAGE_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    file: Express.Multer.File,
  ): Promise<UploadMenuItemImageResponseDto> {
    const imageUrl = await this.cloudinaryService.upload(file);
    return new UploadMenuItemImageResponseDto({ imageUrl });
  }

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
