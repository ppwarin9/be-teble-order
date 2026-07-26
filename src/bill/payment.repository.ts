import { BillShare, Payment, Prisma } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

export type PaymentWithBillShare = Payment & { billShare: BillShare };

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  async getById(id: string): Promise<PaymentWithBillShare | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { billShare: true },
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
