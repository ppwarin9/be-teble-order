import { Prisma, TableSession } from '@/database/generated/prisma/client';
import { SessionStatus } from '@/database/generated/prisma/enums';
import { PrismaService } from '@/database/prisma.service';
import { TableSessionRepositoryInterface } from '@/table-session/table-session.repository.interface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class TableSessionRepository extends TableSessionRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

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

  async findOrCreateOpenSession(diningTableId: string): Promise<TableSession> {
    let session = await this.findOpenByDiningTableId(diningTableId);

    if (!session) {
      try {
        session = await this.create(diningTableId);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          session = await this.findOpenByDiningTableId(diningTableId);
          if (!session) {
            throw new InternalServerErrorException(
              'Unable to join the table session at this time.',
            );
          }
        } else {
          throw error;
        }
      }
    }

    return session;
  }
}
