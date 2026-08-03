import { Payment, Prisma } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import {
  PaymentRepositoryInterface,
  PaymentWithBillShare,
} from '@/bill/payment.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentRepository extends PaymentRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  async getById(id: string): Promise<PaymentWithBillShare | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { billShare: { include: { bill: true } } },
    });
  }

  async getActiveForBillShare(billShareId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: {
        billShareId,
        status: { in: ['PENDING', 'NOTIFIED', 'CONFIRMED'] },
      },
    });
  }

  async updateStatus(
    id: string,
    data: Prisma.PaymentUncheckedUpdateInput,
  ): Promise<Payment> {
    return this.prisma.payment.update({ where: { id }, data });
  }
}
