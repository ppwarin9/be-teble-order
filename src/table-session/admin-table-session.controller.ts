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
  constructor(private readonly tableSessionService: TableSessionService) {}

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
