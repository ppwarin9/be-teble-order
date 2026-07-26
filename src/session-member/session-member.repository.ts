import {
  Prisma,
  SessionMember,
  TableSession,
} from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

export type SessionMemberWithTableSession = SessionMember & {
  tableSession: TableSession;
};

@Injectable()
export class SessionMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByToken(
    sessionToken: string,
  ): Promise<SessionMemberWithTableSession | null> {
    return this.prisma.sessionMember.findUnique({
      where: { sessionToken },
      include: { tableSession: true },
    });
  }

  async findOpenMembershipByCustomerId(
    customerId: string,
  ): Promise<SessionMemberWithTableSession | null> {
    return this.prisma.sessionMember.findFirst({
      where: { customerId, tableSession: { status: 'OPEN' } },
      include: { tableSession: true },
    });
  }

  async findByTableSessionAndCustomer(
    tableSessionId: string,
    customerId: string,
  ): Promise<SessionMember | null> {
    return this.prisma.sessionMember.findUnique({
      where: { tableSessionId_customerId: { tableSessionId, customerId } },
    });
  }

  async create(
    data: Prisma.SessionMemberUncheckedCreateInput,
  ): Promise<SessionMember> {
    return this.prisma.sessionMember.create({ data });
  }

  async getById(id: string): Promise<SessionMember | null> {
    return this.prisma.sessionMember.findUnique({ where: { id } });
  }

  async getAllByTableSessionId(
    tableSessionId: string,
  ): Promise<SessionMember[]> {
    return this.prisma.sessionMember.findMany({
      where: { tableSessionId },
      orderBy: { joinedAt: 'asc' },
    });
  }
}
