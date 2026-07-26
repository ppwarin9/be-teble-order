import { CustomerModule } from '@/customer/customer.module';
import { DiningTableModule } from '@/dining-table/dining-table.module';
import { SessionMemberModule } from '@/session-member/session-member.module';
import { AdminTableSessionController } from '@/table-session/admin-table-session.controller';
import { CustomerTableSessionController } from '@/table-session/customer-table-session.controller';
import { TableSessionRepository } from '@/table-session/table-session.repository';
import { TableSessionService } from '@/table-session/table-session.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [DiningTableModule, CustomerModule, SessionMemberModule],
  controllers: [CustomerTableSessionController, AdminTableSessionController],
  providers: [TableSessionService, TableSessionRepository],
  exports: [TableSessionService, TableSessionRepository],
})
export class TableSessionModule {}
