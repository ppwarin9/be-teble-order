import { DiningTable, Prisma } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DiningTableRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<DiningTable[]> {
    return this.prisma.diningTable.findMany({
      orderBy: { tableNumber: 'asc' },
    });
  }

  async getById(id: string): Promise<DiningTable | null> {
    return this.prisma.diningTable.findUnique({
      where: { id },
    });
  }

  async getByQrToken(qrToken: string): Promise<DiningTable | null> {
    return this.prisma.diningTable.findUnique({
      where: { qrToken },
    });
  }

  async create(data: Prisma.DiningTableCreateInput): Promise<DiningTable> {
    return this.prisma.diningTable.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.DiningTableUpdateInput,
  ): Promise<DiningTable> {
    return this.prisma.diningTable.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<DiningTable> {
    return this.prisma.diningTable.delete({
      where: { id },
    });
  }

  async hasOpenSession(tableId: string): Promise<boolean> {
    const activeSession = await this.prisma.tableSession.findFirst({
      where: {
        diningTableId: tableId,
        status: 'OPEN',
      },
    });
    return !!activeSession;
  }
}
