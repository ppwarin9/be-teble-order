import { AdminPaymentController } from '@/bill/admin-payment.controller';
import { BillRepository } from '@/bill/bill.repository';
import { BillRepositoryInterface } from '@/bill/bill.repository.interface';
import { BillService } from '@/bill/bill.service';
import { BillShareRepository } from '@/bill/bill-share.repository';
import { BillShareRepositoryInterface } from '@/bill/bill-share.repository.interface';
import { CustomerBillController } from '@/bill/customer-bill.controller';
import { PaymentRepository } from '@/bill/payment.repository';
import { PaymentRepositoryInterface } from '@/bill/payment.repository.interface';
import { PaymentService } from '@/bill/payment.service';
import { SessionMemberModule } from '@/session-member/session-member.module';
import { StoreSettingModule } from '@/store-setting/store-setting.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [SessionMemberModule, StoreSettingModule],
  controllers: [CustomerBillController, AdminPaymentController],
  providers: [
    BillService,
    { provide: BillRepositoryInterface, useClass: BillRepository },
    { provide: BillShareRepositoryInterface, useClass: BillShareRepository },
    { provide: PaymentRepositoryInterface, useClass: PaymentRepository },
    PaymentService,
  ],
  exports: [BillService, BillRepositoryInterface, PaymentService],
})
export class BillModule {}
