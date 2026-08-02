import { CustomerRepositoryInterface } from '@/customer/customer.repository.interface';
import { DiningTableRepositoryInterface } from '@/dining-table/dining-table.repository.interface';
import { TableSession } from '@/database/generated/prisma/client';
import { SessionStatus } from '@/database/generated/prisma/enums';
import { LineAuthService } from '@/infrastructure/line/line-auth.service';
import {
  SessionMemberRepositoryInterface,
  SessionMemberWithCustomer,
} from '@/session-member/session-member.repository.interface';
import { JoinTableSessionDto } from '@/table-session/dto/join-table-session.dto';
import { TableSessionRepositoryInterface } from '@/table-session/table-session.repository.interface';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

export type JoinTableSessionResult = {
  sessionToken: string;
  sessionMemberId: string;
  tableSession: TableSession;
  tableNumber: string;
};

@Injectable()
export class TableSessionService {
  constructor(
    private readonly repository: TableSessionRepositoryInterface,
    private readonly diningTableRepository: DiningTableRepositoryInterface,
    private readonly customerRepository: CustomerRepositoryInterface,
    private readonly sessionMemberRepository: SessionMemberRepositoryInterface,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly lineAuthService: LineAuthService,
  ) {}

  async joinByQrToken(
    dto: JoinTableSessionDto,
  ): Promise<JoinTableSessionResult> {
    const table = await this.diningTableRepository.getByQrToken(dto.qrToken);
    if (!table || !table.isActive) {
      throw new NotFoundException('Dining table not found');
    }

    // lineUserId comes only from the verified token, never from the request
    // body, so a customer's identity can't be spoofed or their live session
    // hijacked by whoever guesses/knows it.
    const { lineUserId } = await this.lineAuthService.verifyIdToken(
      dto.idToken,
    );

    const tableSession = await this.repository.findOrCreateOpenSession(
      table.id,
    );

    const customer = await this.customerRepository.upsertByLineUserId({
      lineUserId,
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
      tableNumber: table.tableNumber,
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
    const session = await this.repository.close(id);
    this.realtimeGateway.emitToTableSession(id, 'session:closed', {
      tableSessionId: id,
    });
    this.realtimeGateway.emitToAdmin('session:closed', { tableSessionId: id });
    return session;
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
