import { ExceptionFilter, Module, Type } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/config/env.validation';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from '@/common/filters/prisma-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv as (
        config: Record<string, any>,
      ) => Record<string, any>,
    }),
    DatabaseModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter as Type<ExceptionFilter>,
    },
  ],
})
export class AppModule {}
