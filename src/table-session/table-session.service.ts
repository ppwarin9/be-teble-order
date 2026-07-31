import { CustomerRepositoryInterface } from '@/customer/customer.repository.interface';
import { DiningTableRepositoryInterface } from '@/dining-table/dining-table.repository.interface';
import { TableSession } from '@/database/generated/prisma/client';
import { SessionStatus } from '@/database/generated/prisma/enums';
import {
  SessionMemberRepositoryInterface,
  SessionMemberWithCustomer,
} from '@/session-member/session-member.repository.interface';
import { JoinTableSessionDto } from '@/table-session/dto/join-table-session.dto';
import { TableSessionRepositoryInterface } from '@/table-session/table-session.repository.interface';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

export type JoinTableSessionResult = {
  sessionToken: string;
  sessionMemberId: string;
  tableSession: TableSession;
};

@Injectable()
export class TableSessionService {
  constructor(
    private readonly repository: TableSessionRepositoryInterface,
    private readonly diningTableRepository: DiningTableRepositoryInterface,
    private readonly customerRepository: CustomerRepositoryInterface,
    private readonly sessionMemberRepository: SessionMemberRepositoryInterface,
  ) {}

  async joinByQrToken(
    dto: JoinTableSessionDto,
  ): Promise<JoinTableSessionResult> {
    const table = await this.diningTableRepository.getByQrToken(dto.qrToken);
    if (!table || !table.isActive) {
      throw new NotFoundException('Dining table not found');
    }
    const tableSession = await this.repository.findOrCreateOpenSession(
      table.id,
    );

    const customer = await this.customerRepository.upsertByLineUserId({
      lineUserId: dto.lineUserId,
      displayName: dto.displayName,
      pictureUrl: dto.pictureUrl,
    });

    const existingOpenMembership =
      await this.sessionMemberRepository.findOpenMembershipByCustomerId(
        customer.id,
      );

    if (
      existingOpenMembership &&
      existingOpenMembership.tableSessionId !== tableSession.id
    ) {
      throw new ConflictException(
        'This customer already has an active session at another table',
      );
    }

    const member =
      existingOpenMembership ??
      (await this.sessionMemberRepository.create({
        tableSessionId: tableSession.id,
        customerId: customer.id,
        sessionToken: crypto.randomUUID(),
      }));

    return {
      sessionToken: member.sessionToken,
      sessionMemberId: member.id,
      tableSession,
    };
  }

  async getAll(status?: SessionStatus): Promise<TableSession[]> {
    return this.repository.getAll(status);
  }

  async getOne(id: string): Promise<TableSession> {
    return this.findByIdOrThrow(id);
  }

  async close(id: string): Promise<TableSession> {
    await this.findByIdOrThrow(id);
    return this.repository.close(id);
  }

  async getMembers(
    tableSessionId: string,
  ): Promise<SessionMemberWithCustomer[]> {
    await this.findByIdOrThrow(tableSessionId);
    return this.sessionMemberRepository.getAllByTableSessionId(tableSessionId);
  }

  private async findByIdOrThrow(id: string): Promise<TableSession> {
    const tableSession = await this.repository.getById(id);
    if (!tableSession) {
      throw new NotFoundException('Table session not found');
    }
    return tableSession;
  }
}
