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
import { RolesGuard } from '@/auth/guards/roles.guard';
import { StoreSettingModule } from './store-setting/store-setting.module';
import { DiningTableModule } from './dining-table/dining-table.module';
import { MenuCategoryModule } from './menu-category/menu-category.module';
import { MenuItemModule } from './menu-item/menu-item.module';
import { CustomerModule } from './customer/customer.module';
import { SessionMemberModule } from './session-member/session-member.module';
import { TableSessionModule } from './table-session/table-session.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { BillModule } from './bill/bill.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RealtimeModule } from './realtime/realtime.module';

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
    StoreSettingModule,
    DiningTableModule,
    MenuCategoryModule,
    MenuItemModule,
    CustomerModule,
    SessionMemberModule,
    TableSessionModule,
    CartModule,
    OrderModule,
    BillModule,
    DashboardModule,
    RealtimeModule,
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
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
