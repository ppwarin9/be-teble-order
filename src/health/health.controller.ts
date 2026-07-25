import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Public } from '@/common/decorators/public.decorator';
import { PrismaService } from '@/database/prisma.service';
import { HealthResponseDto } from '@/health/dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaIndicator: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOkResponse({
    description: 'Service and its dependencies are healthy.',
    type: HealthResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Service or one of its dependencies is unhealthy.',
  })
  async check(): Promise<HealthResponseDto> {
    const result = await this.health.check([
      () => this.prismaIndicator.pingCheck('database', this.prisma),
    ]);

    return plainToInstance(HealthResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
