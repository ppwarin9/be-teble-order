import { AuthenticatedSessionMember } from '@/auth/types/session.type';
import { BillRepository } from '@/bill/bill.repository';
import { BillShareRepository } from '@/bill/bill-share.repository';
import { CreatePaymentDto } from '@/bill/dto/create-payment.dto';
import { Payment } from '@/database/generated/prisma/client';
import { PaymentRepository } from '@/bill/payment.repository';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly billShareRepository: BillShareRepository,
    private readonly billRepository: BillRepository,
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

    return this.paymentRepository.create({
      billShareId,
      method: dto.method,
      amount: share.amountDue,
    });
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

    return this.paymentRepository.updateStatus(paymentId, {
      status: 'NOTIFIED',
      notifiedAt: new Date(),
    });
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

    const payment = await this.paymentRepository.create({
      billShareId,
      method: 'CASH',
      amount: share.amountDue,
      status: 'CONFIRMED',
      markedBy: staffId,
      paidAt: new Date(),
    });

    await this.cascadeAfterConfirm(billShareId);

    return payment;
  }

  async failPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.getById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.paymentRepository.updateStatus(paymentId, {
      status: 'FAILED',
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
