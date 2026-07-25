import { Body, Controller, Get, Post } from '@nestjs/common';
import { DiningTableService } from './dining-table.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { DiningTableResponseDto } from '@/dining-table/dto/dining-table-response.dto';
import { CreateDiningTableDto } from '@/dining-table/dto/create-dining-table.dto';

@ApiTags('Dining Table')
@Controller('admin/tables')
export class DiningTableController {
  constructor(private readonly diningTableService: DiningTableService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new dining table' })
  @ApiCreatedResponse({
    description: 'Dining table successfully created',
    type: DiningTableResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(
    @Body() createDiningTableDto: CreateDiningTableDto,
  ): Promise<DiningTableResponseDto> {
    return this.diningTableService.create(createDiningTableDto);
  }
}
