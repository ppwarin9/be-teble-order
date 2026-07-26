import { TableSession } from '@/database/generated/prisma/client';
import { SessionStatus } from '@/database/generated/prisma/enums';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TableSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOpenByDiningTableId(
    diningTableId: string,
  ): Promise<TableSession | null> {
    return this.prisma.tableSession.findFirst({
      where: { diningTableId, status: 'OPEN' },
    });
  }

  async create(diningTableId: string): Promise<TableSession> {
    return this.prisma.tableSession.create({
      data: { diningTableId },
    });
  }

  async getById(id: string): Promise<TableSession | null> {
    return this.prisma.tableSession.findUnique({ where: { id } });
  }

  async getAll(status?: SessionStatus): Promise<TableSession[]> {
    return this.prisma.tableSession.findMany({
      where: status ? { status } : undefined,
      orderBy: { openedAt: 'desc' },
    });
  }

  async close(id: string): Promise<TableSession> {
    return this.prisma.tableSession.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }
}
