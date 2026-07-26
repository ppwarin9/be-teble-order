import { Bill, BillShare, Prisma } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

export type BillWithShares = Bill & { billShares: BillShare[] };

export type NewBillShareInput = {
  sessionMemberId: string;
  amountDue: number;
};

export type NewBillInput = {
  tableSessionId: string;
  splitMethod: Prisma.BillCreateInput['splitMethod'];
  subtotal: number;
  discountAmount: number;
  serviceChargeRateSnapshot: number;
  serviceChargeAmount: number;
  vatRateSnapShot: number;
  vatAmount: number;
  grandTotal: number;
  currencySnapShot: string;
};

@Injectable()
export class BillRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUnsettledBillForSession(
    tableSessionId: string,
  ): Promise<Bill | null> {
    return this.prisma.bill.findFirst({
      where: { tableSessionId, status: 'OPEN' },
    });
  }

  async getLastSettledBill(tableSessionId: string): Promise<Bill | null> {
    return this.prisma.bill.findFirst({
      where: { tableSessionId, status: 'SETTLED' },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async sumOrderItemsSince(
    tableSessionId: string,
    sinceDate?: Date,
  ): Promise<number> {
    const items = await this.prisma.orderItem.findMany({
      where: {
        orderRound: {
          tableSessionId,
          ...(sinceDate && { submittedAt: { gt: sinceDate } }),
        },
      },
      select: { quantity: true, unitPriceSnapshot: true },
    });

    return items.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceSnapshot,
      0,
    );
  }

  async createBillWithShares(
    bill: NewBillInput,
    shares: NewBillShareInput[],
  ): Promise<BillWithShares> {
    return this.prisma.$transaction(async (tx) => {
      const createdBill = await tx.bill.create({ data: bill });

      await tx.billShare.createMany({
        data: shares.map((share) => ({
          ...share,
          billId: createdBill.id,
        })),
      });

      const billShares = await tx.billShare.findMany({
        where: { billId: createdBill.id },
      });

      return { ...createdBill, billShares };
    });
  }

  async getById(id: string): Promise<BillWithShares | null> {
    return this.prisma.bill.findUnique({
      where: { id },
      include: { billShares: true },
    });
  }

  async getAllByTableSessionId(
    tableSessionId: string,
  ): Promise<BillWithShares[]> {
    return this.prisma.bill.findMany({
      where: { tableSessionId },
      include: { billShares: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async settle(id: string): Promise<Bill> {
    return this.prisma.bill.update({
      where: { id },
      data: { status: 'SETTLED', settledAt: new Date() },
    });
  }
}
