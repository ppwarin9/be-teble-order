import { Bill, BillShare, Prisma } from '@/database/generated/prisma/client';

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

export abstract class BillRepositoryInterface {
  abstract getUnsettledBillForSession(
    tableSessionId: string,
  ): Promise<Bill | null>;

  abstract getLastSettledBill(tableSessionId: string): Promise<Bill | null>;

  abstract sumOrderItemsSince(
    tableSessionId: string,
    sinceDate?: Date,
  ): Promise<number>;

  abstract createBillWithShares(
    bill: NewBillInput,
    shares: NewBillShareInput[],
  ): Promise<BillWithShares>;

  abstract getById(id: string): Promise<BillWithShares | null>;

  abstract getAllByTableSessionId(
    tableSessionId: string,
  ): Promise<BillWithShares[]>;

  abstract settle(id: string): Promise<Bill>;
}
