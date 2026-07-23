import { ExceptionFilter, Module, Type } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/config/env.validation';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { PrismaExceptionFilter } from '@/common/filters/prisma-exception.filter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { StaffUserModule } from './staff-user/staff-user.module';
import { RoleModule } from './role/role.module';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv as (
        config: Record<string, any>,
      ) => Record<string, any>,
    }),
    DatabaseModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    HealthModule,
    AuthModule,
    StaffUserModule,
    RoleModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter as Type<ExceptionFilter>,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
