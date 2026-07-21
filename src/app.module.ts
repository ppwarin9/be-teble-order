import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      validate: validateEnv,
    }),
    DatabaseModule,
  ],
  providers: [],
})
export class AppModule {}
