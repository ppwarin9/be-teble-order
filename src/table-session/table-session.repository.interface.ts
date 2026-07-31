import { TableSession } from '@/database/generated/prisma/client';
import { SessionStatus } from '@/database/generated/prisma/enums';

export abstract class TableSessionRepositoryInterface {
  abstract findOpenByDiningTableId(
    diningTableId: string,
  ): Promise<TableSession | null>;

  abstract create(diningTableId: string): Promise<TableSession>;

  abstract getById(id: string): Promise<TableSession | null>;

  abstract getAll(status?: SessionStatus): Promise<TableSession[]>;

  abstract close(id: string): Promise<TableSession>;

  abstract findOrCreateOpenSession(
    diningTableId: string,
  ): Promise<TableSession>;
}
