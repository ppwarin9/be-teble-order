import { Roles } from '@/common/decorators/roles.decorator';
import { ActiveSessionSummaryResponseDto } from '@/dashboard/dto/active-session-summary-response.dto';
import { DailySalesResponseDto } from '@/dashboard/dto/daily-sales-response.dto';
import { DashboardService } from '@/dashboard/dashboard.service';
import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('daily-sales')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get daily sales totals' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'YYYY-MM-DD, defaults to today (UTC).',
  })
  @ApiOkResponse({
    description: 'Daily sales summary.',
    type: DailySalesResponseDto,
  })
  async getDailySales(
    @Query('date') date?: string,
  ): Promise<DailySalesResponseDto> {
    const sales = await this.dashboardService.getDailySales(date);
    return new DailySalesResponseDto(sales);
  }

  @Get('active-sessions')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all currently active (OPEN) table sessions' })
  @ApiOkResponse({
    description: 'List of active sessions.',
    type: [ActiveSessionSummaryResponseDto],
  })
  async getActiveSessions(): Promise<ActiveSessionSummaryResponseDto[]> {
    const sessions = await this.dashboardService.getActiveSessions();
    return sessions.map(
      (session) => new ActiveSessionSummaryResponseDto(session),
    );
  }
}
