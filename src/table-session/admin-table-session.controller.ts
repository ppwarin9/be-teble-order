import { BillResponseDto } from '@/bill/dto/bill-response.dto';
import { BillService } from '@/bill/bill.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { SessionStatus } from '@/database/generated/prisma/enums';
import { SessionMemberResponseDto } from '@/session-member/dto/session-member-response.dto';
import { TableSessionResponseDto } from '@/table-session/dto/table-session-response.dto';
import { TableSessionService } from '@/table-session/table-session.service';
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin - Table Session')
@ApiBearerAuth()
@Controller('admin/table-sessions')
export class AdminTableSessionController {
  constructor(
    private readonly tableSessionService: TableSessionService,
    private readonly billService: BillService,
  ) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get all table sessions' })
  @ApiQuery({ name: 'status', enum: ['OPEN', 'CLOSED'], required: false })
  @ApiOkResponse({
    description: 'List of table sessions.',
    type: [TableSessionResponseDto],
  })
  async getAll(
    @Query('status') status?: SessionStatus,
  ): Promise<TableSessionResponseDto[]> {
    const sessions = await this.tableSessionService.getAll(status);
    return sessions.map((session) => new TableSessionResponseDto(session));
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get a table session by id' })
  @ApiOkResponse({
    description: 'Table session found.',
    type: TableSessionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Table session not found.' })
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TableSessionResponseDto> {
    const session = await this.tableSessionService.getOne(id);
    return new TableSessionResponseDto(session);
  }

  @Get(':id/members')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get all members of a table session' })
  @ApiOkResponse({
    description: 'List of session members.',
    type: [SessionMemberResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Table session not found.' })
  async getMembers(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SessionMemberResponseDto[]> {
    const members = await this.tableSessionService.getMembers(id);
    return members.map((member) => new SessionMemberResponseDto(member));
  }

  @Get(':id/bill')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({
    summary: "Get the current table session's most recent bill",
    description:
      'Returns the most recently issued bill for this table session (the in-flight OPEN one if a bill has been issued, otherwise the last SETTLED one), with its bill shares.',
  })
  @ApiOkResponse({ description: 'Bill found.', type: BillResponseDto })
  @ApiNotFoundResponse({
    description:
      'Table session not found, or no bill has been issued for it yet.',
  })
  async getBill(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BillResponseDto> {
    await this.tableSessionService.getOne(id);
    const bill = await this.billService.getForAdmin(id);
    return new BillResponseDto(bill);
  }

  @Patch(':id/close')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Force-close a table session',
    description:
      'Immediately invalidates every sessionToken issued under this table session, freeing the table for the next guest.',
  })
  @ApiOkResponse({
    description: 'Table session closed.',
    type: TableSessionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Table session not found.' })
  async close(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TableSessionResponseDto> {
    const session = await this.tableSessionService.close(id);
    return new TableSessionResponseDto(session);
  }
}
