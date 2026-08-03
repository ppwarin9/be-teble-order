import { Prisma, SessionMember } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import {
  SessionMemberRepositoryInterface,
  SessionMemberWithCustomer,
  SessionMemberWithTableSession,
} from '@/session-member/session-member.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionMemberRepository extends SessionMemberRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

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
  ): Promise<SessionMemberWithCustomer[]> {
    return this.prisma.sessionMember.findMany({
      where: { tableSessionId },
      include: { customer: true },
      orderBy: { joinedAt: 'asc' },
    });
  }
}
