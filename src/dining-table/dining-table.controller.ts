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
import { DiningTableService } from './dining-table.service';
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
import { Roles } from '@/common/decorators/roles.decorator';
import { DiningTableResponseDto } from '@/dining-table/dto/dining-table-response.dto';
import { CreateDiningTableDto } from '@/dining-table/dto/create-dining-table.dto';
import { UpdateDiningTableDto } from '@/dining-table/dto/update-dining-table.dto';

@ApiTags('Dining Table')
@ApiBearerAuth()
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
  async create(
    @Body() createDiningTableDto: CreateDiningTableDto,
  ): Promise<DiningTableResponseDto> {
    const table = await this.diningTableService.create(createDiningTableDto);
    return new DiningTableResponseDto(table);
  }

  @Get()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get all dining tables' })
  @ApiOkResponse({
    description: 'List of dining tables',
    type: [DiningTableResponseDto],
  })
  async getAll(): Promise<DiningTableResponseDto[]> {
    const tables = await this.diningTableService.getAll();
    return tables.map((table) => new DiningTableResponseDto(table));
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get a dining table by id' })
  @ApiOkResponse({
    description: 'Successfully retrieved the dining table details.',
    type: DiningTableResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Dining table with the specified ID was not found.',
  })
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DiningTableResponseDto> {
    const table = await this.diningTableService.getOne(id);
    return new DiningTableResponseDto(table);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a dining table' })
  @ApiOkResponse({
    description: 'Successfully dining table updated',
    type: DiningTableResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Dining table not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDiningTableDto: UpdateDiningTableDto,
  ): Promise<DiningTableResponseDto> {
    const table = await this.diningTableService.update(
      id,
      updateDiningTableDto,
    );
    return new DiningTableResponseDto(table);
  }

  @Patch(':id/regenerate-qr')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Regenerate the QR token for a dining table',
    description:
      'Issues a new qrToken and qrGeneratedAt timestamp, invalidating the previously printed QR code for this table.',
  })
  @ApiOkResponse({
    description: 'QR token successfully regenerated',
    type: DiningTableResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Dining table not found' })
  async regenerateQr(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DiningTableResponseDto> {
    const table = await this.diningTableService.regenerateQr(id);
    return new DiningTableResponseDto(table);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a dining table' })
  @ApiNoContentResponse({ description: 'Dining table successfully deleted' })
  @ApiNotFoundResponse({ description: 'Dining table not found' })
  @ApiConflictResponse({
    description: 'Cannot delete a table that has an active session',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.diningTableService.remove(id);
  }
}
