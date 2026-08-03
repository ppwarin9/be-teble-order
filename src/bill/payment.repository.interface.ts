import {
  Bill,
  BillShare,
  Payment,
  Prisma,
} from '@/database/generated/prisma/client';

export type PaymentWithBillShare = Payment & {
  billShare: BillShare & { bill: Bill };
};

export abstract class PaymentRepositoryInterface {
  abstract create(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment>;

  abstract getById(id: string): Promise<PaymentWithBillShare | null>;

  abstract getActiveForBillShare(billShareId: string): Promise<Payment[]>;

  abstract updateStatus(
    id: string,
    data: Prisma.PaymentUncheckedUpdateInput,
  ): Promise<Payment>;
}
