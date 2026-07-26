import { AdminPaymentController } from '@/bill/admin-payment.controller';
import { BillRepository } from '@/bill/bill.repository';
import { BillService } from '@/bill/bill.service';
import { BillShareRepository } from '@/bill/bill-share.repository';
import { CustomerBillController } from '@/bill/customer-bill.controller';
import { PaymentRepository } from '@/bill/payment.repository';
import { PaymentService } from '@/bill/payment.service';
import { SessionMemberModule } from '@/session-member/session-member.module';
import { StoreSettingModule } from '@/store-setting/store-setting.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [SessionMemberModule, StoreSettingModule],
  controllers: [CustomerBillController, AdminPaymentController],
  providers: [
    BillService,
    BillRepository,
    BillShareRepository,
    PaymentRepository,
    PaymentService,
  ],
  exports: [BillService, BillRepository, PaymentService],
})
export class BillModule {}
