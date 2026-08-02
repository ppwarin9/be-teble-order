import { BillModule } from '@/bill/bill.module';
import { CustomerModule } from '@/customer/customer.module';
import { DiningTableModule } from '@/dining-table/dining-table.module';
import { LineAuthModule } from '@/infrastructure/line/line-auth.module';
import { SessionMemberModule } from '@/session-member/session-member.module';
import { AdminTableSessionController } from '@/table-session/admin-table-session.controller';
import { CustomerTableSessionController } from '@/table-session/customer-table-session.controller';
import { TableSessionRepository } from '@/table-session/table-session.repository';
import { TableSessionRepositoryInterface } from '@/table-session/table-session.repository.interface';
import { TableSessionService } from '@/table-session/table-session.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    DiningTableModule,
    CustomerModule,
    SessionMemberModule,
    BillModule,
    LineAuthModule,
  ],
  controllers: [CustomerTableSessionController, AdminTableSessionController],
  providers: [
    TableSessionService,
    {
      provide: TableSessionRepositoryInterface,
      useClass: TableSessionRepository,
    },
  ],
  exports: [TableSessionService, TableSessionRepositoryInterface],
})
export class TableSessionModule {}
