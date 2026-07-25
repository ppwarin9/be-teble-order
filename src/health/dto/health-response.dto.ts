import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

class HealthIndicatorStatusDto {
  @Expose()
  @ApiProperty({ example: 'up', enum: ['up', 'down'] })
  status: string;
}

@Exclude()
export class HealthResponseDto {
  @Expose()
  @ApiProperty({
    example: 'ok',
    enum: ['ok', 'error', 'shutting_down'],
    description: 'Overall status of the health check.',
  })
  status: string;

  @Expose()
  @ApiProperty({
    example: { database: { status: 'up' } },
    description: 'Indicators that are currently healthy ("up").',
    type: HealthIndicatorStatusDto,
    additionalProperties: true,
    required: false,
  })
  info?: Record<string, HealthIndicatorStatusDto>;

  @Expose()
  @ApiProperty({
    example: {},
    description: 'Indicators that are currently unhealthy ("down").',
    type: HealthIndicatorStatusDto,
    additionalProperties: true,
    required: false,
  })
  error?: Record<string, HealthIndicatorStatusDto>;

  @Expose()
  @ApiProperty({
    example: { database: { status: 'up' } },
    description: 'Every health indicator, regardless of status.',
    type: HealthIndicatorStatusDto,
    additionalProperties: true,
  })
  details: Record<string, HealthIndicatorStatusDto>;
}
