import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiningTableService } from './dining-table.service';
import { CreateDiningTableDto } from './dto/create-dining-table.dto';
import { UpdateDiningTableDto } from './dto/update-dining-table.dto';

@Controller('dining-table')
export class DiningTableController {
  constructor(private readonly diningTableService: DiningTableService) {}

  @Post()
  create(@Body() createDiningTableDto: CreateDiningTableDto) {
    return this.diningTableService.create(createDiningTableDto);
  }

  @Get()
  findAll() {
    return this.diningTableService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diningTableService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiningTableDto: UpdateDiningTableDto) {
    return this.diningTableService.update(+id, updateDiningTableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diningTableService.remove(+id);
  }
}
