import { Controller } from '@nestjs/common';
import { MenuItemService } from './menu-item.service';

@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}
}
