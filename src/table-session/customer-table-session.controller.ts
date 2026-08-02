import { CurrentSessionMember } from '@/auth/decorators/current-session-member.decorator';
import { SessionTokenGuard } from '@/auth/guards/session-token.guard';
import { type AuthenticatedSessionMember } from '@/auth/types/session.type';
import { Public } from '@/common/decorators/public.decorator';
import { SessionMemberResponseDto } from '@/session-member/dto/session-member-response.dto';
import { JoinSessionResponseDto } from '@/table-session/dto/join-session-response.dto';
import { JoinTableSessionDto } from '@/table-session/dto/join-table-session.dto';
import { TableSessionResponseDto } from '@/table-session/dto/table-session-response.dto';
import { TableSessionService } from '@/table-session/table-session.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Customer - Table Session')
@Public()
@Controller('liff/table-sessions')
export class CustomerTableSessionController {
  constructor(private readonly tableSessionService: TableSessionService) {}

  @Post('join')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Join a table session by scanning the table QR code',
    description:
      'Opens a new table session if none is currently open for the scanned table, upserts the LINE customer, and joins them as a session member. Returns a sessionToken to use as a Bearer token on all subsequent customer requests.',
  })
  @ApiCreatedResponse({
    description: 'Joined the table session successfully.',
    type: JoinSessionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Dining table not found or inactive.' })
  @ApiConflictResponse({
    description:
      'This customer already has an active session at another table.',
  })
  async join(
    @Body() dto: JoinTableSessionDto,
  ): Promise<JoinSessionResponseDto> {
    const result = await this.tableSessionService.joinByQrToken(dto);
    return new JoinSessionResponseDto(result);
  }

  @Get('current')
  @ApiBearerAuth()
  @UseGuards(SessionTokenGuard)
  @ApiOperation({
    summary: "Get the customer's current table session status",
    description:
      'Lets the client detect an OPEN vs CLOSED session directly instead of only reactively via a 401 on the next unrelated call.',
  })
  @ApiOkResponse({
    description: 'Current table session.',
    type: TableSessionResponseDto,
  })
  async getCurrent(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
  ): Promise<TableSessionResponseDto> {
    const tableSession = await this.tableSessionService.getOne(
      sessionMember.tableSessionId,
    );
    return new TableSessionResponseDto(tableSession);
  }

  @Get('members')
  @ApiBearerAuth()
  @UseGuards(SessionTokenGuard)
  @ApiOperation({
    summary: "Get all members of the customer's current table session",
  })
  @ApiOkResponse({
    description: 'List of session members.',
    type: [SessionMemberResponseDto],
  })
  async getMembers(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
  ): Promise<SessionMemberResponseDto[]> {
    const members = await this.tableSessionService.getMembers(
      sessionMember.tableSessionId,
    );
    return members.map((member) => new SessionMemberResponseDto(member));
  }
}
