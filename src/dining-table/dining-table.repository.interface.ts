import { DiningTable, Prisma } from '@/database/generated/prisma/client';

export abstract class DiningTableRepositoryInterface {
  abstract getAll(): Promise<DiningTable[]>;

  abstract getById(id: string): Promise<DiningTable | null>;

  abstract getByQrToken(qrToken: string): Promise<DiningTable | null>;

  abstract create(data: Prisma.DiningTableCreateInput): Promise<DiningTable>;

  abstract update(
    id: string,
    data: Prisma.DiningTableUpdateInput,
  ): Promise<DiningTable>;

  abstract delete(id: string): Promise<DiningTable>;

  abstract hasOpenSession(tableId: string): Promise<boolean>;
}
