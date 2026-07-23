import { ApiProperty } from '@nestjs/swagger';

class HealthIndicatorStatusDto {
  @ApiProperty({ example: 'up', enum: ['up', 'down'] })
  status: string;
}

export class HealthResponseDto {
  @ApiProperty({
    example: 'ok',
    enum: ['ok', 'error', 'shutting_down'],
    description: 'Overall status of the health check.',
  })
  status: string;

  @ApiProperty({
    example: { database: { status: 'up' } },
    description: 'Indicators that are currently healthy ("up").',
    type: HealthIndicatorStatusDto,
    additionalProperties: true,
    required: false,
  })
  info?: Record<string, HealthIndicatorStatusDto>;

  @ApiProperty({
    example: {},
    description: 'Indicators that are currently unhealthy ("down").',
    type: HealthIndicatorStatusDto,
    additionalProperties: true,
    required: false,
  })
  error?: Record<string, HealthIndicatorStatusDto>;

  @ApiProperty({
    example: { database: { status: 'up' } },
    description: 'Every health indicator, regardless of status.',
    type: HealthIndicatorStatusDto,
    additionalProperties: true,
  })
  details: Record<string, HealthIndicatorStatusDto>;
}
