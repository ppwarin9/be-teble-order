import { Public } from '@/common/decorators/public.decorator';
import { JoinSessionResponseDto } from '@/table-session/dto/join-session-response.dto';
import { JoinTableSessionDto } from '@/table-session/dto/join-table-session.dto';
import { TableSessionService } from '@/table-session/table-session.service';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
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
}
