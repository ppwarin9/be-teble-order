import { AuthenticatedSessionMember } from '@/auth/types/session.type';
import { BillRepositoryInterface } from '@/bill/bill.repository.interface';
import { BillShareRepositoryInterface } from '@/bill/bill-share.repository.interface';
import { CreatePaymentDto } from '@/bill/dto/create-payment.dto';
import { Payment } from '@/database/generated/prisma/client';
import { PaymentRepositoryInterface } from '@/bill/payment.repository.interface';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepositoryInterface,
    private readonly billShareRepository: BillShareRepositoryInterface,
    private readonly billRepository: BillRepositoryInterface,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createPayment(
    sessionMember: AuthenticatedSessionMember,
    billShareId: string,
    dto: CreatePaymentDto,
  ): Promise<Payment> {
    const share = await this.billShareRepository.getById(billShareId);
    if (!share) {
      throw new NotFoundException('Bill share not found');
    }
    if (share.sessionMemberId !== sessionMember.id) {
      throw new ForbiddenException('This bill share does not belong to you');
    }
    if (share.status === 'PAID') {
      throw new ConflictException('This bill share has already been paid');
    }

    const activePayments =
      await this.paymentRepository.getActiveForBillShare(billShareId);
    if (activePayments.length > 0) {
      throw new ConflictException(
        'A payment for this bill share is already in progress',
      );
    }

    const payment = await this.paymentRepository.create({
      billShareId,
      method: dto.method,
      amount: share.amountDue,
    });
    await this.emitForBillShare(billShareId, ['payment:updated']);
    return payment;
  }

  async notifyPayment(
    sessionMember: AuthenticatedSessionMember,
    paymentId: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.getById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.billShare.sessionMemberId !== sessionMember.id) {
      throw new ForbiddenException('This payment does not belong to you');
    }
    if (payment.status !== 'PENDING') {
      throw new ConflictException('Only a pending payment can be notified');
    }

    const updated = await this.paymentRepository.updateStatus(paymentId, {
      status: 'NOTIFIED',
      notifiedAt: new Date(),
    });
    await this.emitForBillShare(payment.billShareId, ['payment:updated']);
    return updated;
  }

  async confirmPayment(staffId: string, paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.getById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status === 'CONFIRMED') {
      throw new ConflictException('Payment has already been confirmed');
    }

    const updated = await this.paymentRepository.updateStatus(paymentId, {
      status: 'CONFIRMED',
      confirmedBy: staffId,
      paidAt: new Date(),
    });

    await this.cascadeAfterConfirm(payment.billShareId);
    await this.emitForBillShare(payment.billShareId, [
      'payment:updated',
      'bill_share:updated',
    ]);

    return updated;
  }

  async markCashPaid(staffId: string, billShareId: string): Promise<Payment> {
    const share = await this.billShareRepository.getById(billShareId);
    if (!share) {
      throw new NotFoundException('Bill share not found');
    }
    if (share.status === 'PAID') {
      throw new ConflictException('This bill share has already been paid');
    }

    const activePayments =
      await this.paymentRepository.getActiveForBillShare(billShareId);
    if (activePayments.length > 0) {
      throw new ConflictException(
        'A payment for this bill share is already in progress',
      );
    }

    const payment = await this.paymentRepository.create({
      billShareId,
      method: 'CASH',
      amount: share.amountDue,
      status: 'CONFIRMED',
      markedBy: staffId,
      paidAt: new Date(),
    });

    await this.cascadeAfterConfirm(billShareId);
    await this.emitForBillShare(billShareId, [
      'payment:updated',
      'bill_share:updated',
    ]);

    return payment;
  }

  async failPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.getById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const updated = await this.paymentRepository.updateStatus(paymentId, {
      status: 'FAILED',
    });
    await this.emitForBillShare(payment.billShareId, ['payment:updated']);
    return updated;
  }

  private async emitForBillShare(
    billShareId: string,
    events: string[],
  ): Promise<void> {
    const share = await this.billShareRepository.getById(billShareId);
    if (!share) {
      return;
    }
    const bill = await this.billRepository.getById(share.billId);
    if (!bill) {
      return;
    }
    events.forEach((event) => {
      this.realtimeGateway.emitToTableSession(bill.tableSessionId, event, {
        billShareId,
      });
      this.realtimeGateway.emitToAdmin(event, {
        billShareId,
        tableSessionId: bill.tableSessionId,
      });
    });
  }

  private async cascadeAfterConfirm(billShareId: string): Promise<void> {
    await this.billShareRepository.updateStatus(billShareId, 'PAID');

    const share = await this.billShareRepository.getById(billShareId);
    if (!share) {
      return;
    }

    const allPaid = await this.billShareRepository.areAllSharesPaid(
      share.billId,
    );
    if (allPaid) {
      await this.billRepository.settle(share.billId);
    }
  }
}
