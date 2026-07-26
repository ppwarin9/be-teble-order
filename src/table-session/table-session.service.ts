import { CustomerRepository } from '@/customer/customer.repository';
import { DiningTableRepository } from '@/dining-table/dining-table.repository';
import { TableSession } from '@/database/generated/prisma/client';
import { SessionStatus } from '@/database/generated/prisma/enums';
import { SessionMemberRepository } from '@/session-member/session-member.repository';
import { JoinTableSessionDto } from '@/table-session/dto/join-table-session.dto';
import { TableSessionRepository } from '@/table-session/table-session.repository';
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
    private readonly repository: TableSessionRepository,
    private readonly diningTableRepository: DiningTableRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly sessionMemberRepository: SessionMemberRepository,
  ) {}

  async joinByQrToken(
    dto: JoinTableSessionDto,
  ): Promise<JoinTableSessionResult> {
    const table = await this.diningTableRepository.getByQrToken(dto.qrToken);
    if (!table || !table.isActive) {
      throw new NotFoundException('Dining table not found');
    }

    let tableSession = await this.repository.findOpenByDiningTableId(table.id);
    if (!tableSession) {
      tableSession = await this.repository.create(table.id);
    }

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

  private async findByIdOrThrow(id: string): Promise<TableSession> {
    const tableSession = await this.repository.getById(id);
    if (!tableSession) {
      throw new NotFoundException('Table session not found');
    }
    return tableSession;
  }
}
