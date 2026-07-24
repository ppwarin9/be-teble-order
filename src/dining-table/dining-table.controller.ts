import { Controller } from '@nestjs/common';
import { DiningTableService } from './dining-table.service';

@Controller('dining-table')
export class DiningTableController {
  constructor(private readonly diningTableService: DiningTableService) {}
}
