import { BillShare } from '@/database/generated/prisma/client';
import { BillShareStatus } from '@/database/generated/prisma/enums';

export abstract class BillShareRepositoryInterface {
  abstract getById(id: string): Promise<BillShare | null>;

  abstract updateStatus(
    id: string,
    status: BillShareStatus,
  ): Promise<BillShare>;

  abstract areAllSharesPaid(billId: string): Promise<boolean>;
}
