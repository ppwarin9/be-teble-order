import { AuthenticatedSessionMember } from '@/auth/types/session.type';
import {
  BillRepositoryInterface,
  BillWithShares,
  NewBillShareInput,
} from '@/bill/bill.repository.interface';
import { GenerateBillDto } from '@/bill/dto/generate-bill.dto';
import { PaymentRepositoryInterface } from '@/bill/payment.repository.interface';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import { SessionMemberRepositoryInterface } from '@/session-member/session-member.repository.interface';
import { StoreSettingService } from '@/store-setting/store-setting.service';
import { AdminBillResponseDto } from '@/table-session/dto/admin-bill-response.dto';
import { AdminBillShareResponseDto } from '@/table-session/dto/admin-bill-share-response.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class BillService {
  constructor(
    private readonly repository: BillRepositoryInterface,
    private readonly sessionMemberRepository: SessionMemberRepositoryInterface,
    private readonly storeSettingService: StoreSettingService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly paymentRepository: PaymentRepositoryInterface,
  ) {}

  async generateBill(
    sessionMember: AuthenticatedSessionMember,
    dto: GenerateBillDto,
  ): Promise<BillWithShares> {
    const tableSessionId = sessionMember.tableSessionId;

    const unsettledBill =
      await this.repository.getUnsettledBillForSession(tableSessionId);
    if (unsettledBill) {
      throw new ConflictException(
        'An unpaid bill already exists for this table session. Settle or void it before generating a new one.',
      );
    }

    const lastSettledBill =
      await this.repository.getLastSettledBill(tableSessionId);
    const subtotal = await this.repository.sumOrderItemsSince(
      tableSessionId,
      lastSettledBill?.issuedAt,
    );

    if (subtotal === 0) {
      throw new BadRequestException(
        'No billable items found for this table session',
      );
    }

    const storeSetting = await this.storeSettingService.get();
    const discountAmount = 0;
    const serviceChargeAmount = storeSetting.enableServiceCharge
      ? Math.round(subtotal * storeSetting.serviceChargeRate)
      : 0;
    const vatBase = subtotal + serviceChargeAmount;
    const vatAmount = storeSetting.enableVat
      ? Math.round(vatBase * storeSetting.vatRate)
      : 0;
    const grandTotal =
      subtotal - discountAmount + serviceChargeAmount + vatAmount;

    const shares = await this.buildShares(
      sessionMember,
      dto,
      tableSessionId,
      grandTotal,
    );

    const bill = await this.repository.createBillWithShares(
      {
        tableSessionId,
        splitMethod: dto.splitMethod,
        subtotal,
        discountAmount,
        serviceChargeRateSnapshot: storeSetting.serviceChargeRate,
        serviceChargeAmount,
        vatRateSnapShot: storeSetting.vatRate,
        vatAmount,
        grandTotal,
        currencySnapShot: storeSetting.currency,
      },
      shares,
    );

    this.realtimeGateway.emitToTableSession(tableSessionId, 'bill:issued', {
      billId: bill.id,
    });
    this.realtimeGateway.emitToAdmin('bill:issued', {
      billId: bill.id,
      tableSessionId,
    });

    return bill;
  }

  async getBillsForSession(
    sessionMember: AuthenticatedSessionMember,
  ): Promise<BillWithShares[]> {
    return this.repository.getAllByTableSessionId(sessionMember.tableSessionId);
  }

  /** Enriches the raw bill with what the admin billing UI actually needs per share —
   *  a human-readable label (the paying member's name) and which method a CONFIRMED
   *  payment used, if any — neither of which exists on the customer-facing BillWithShares
   *  shape, so this builds a dedicated response rather than reusing BillResponseDto. */
  async getForAdmin(tableSessionId: string): Promise<AdminBillResponseDto> {
    const [latest] =
      await this.repository.getAllByTableSessionId(tableSessionId);
    if (!latest) {
      throw new NotFoundException(
        'No bill has been issued for this table session yet',
      );
    }

    const members =
      await this.sessionMemberRepository.getAllByTableSessionId(
        tableSessionId,
      );
    const memberById = new Map(members.map((m) => [m.id, m]));

    const shares = await Promise.all(
      latest.billShares.map(async (share) => {
        const member = memberById.get(share.sessionMemberId);
        const payments = await this.paymentRepository.getActiveForBillShare(
          share.id,
        );
        const confirmed = payments.find((p) => p.status === 'CONFIRMED');
        return new AdminBillShareResponseDto({
          id: share.id,
          label: member?.customer.displayName ?? 'ผู้เข้าร่วมโต๊ะ',
          amountDue: share.amountDue,
          status: share.status,
          method: confirmed?.method ?? null,
        });
      }),
    );

    return new AdminBillResponseDto({
      tableSessionId: latest.tableSessionId,
      subtotal: latest.subtotal,
      serviceChargeAmount: latest.serviceChargeAmount,
      vatAmount: latest.vatAmount,
      grandTotal: latest.grandTotal,
      status: latest.status,
      shares,
    });
  }

  private async buildShares(
    sessionMember: AuthenticatedSessionMember,
    dto: GenerateBillDto,
    tableSessionId: string,
    grandTotal: number,
  ): Promise<NewBillShareInput[]> {
    if (dto.splitMethod === 'SINGLE_PAYER') {
      const payerId = dto.payerSessionMemberId ?? sessionMember.id;
      const payer = await this.sessionMemberRepository.getById(payerId);
      if (!payer || payer.tableSessionId !== tableSessionId) {
        throw new BadRequestException(
          'payerSessionMemberId must belong to this table session',
        );
      }
      return [{ sessionMemberId: payerId, amountDue: grandTotal }];
    }

    const members =
      await this.sessionMemberRepository.getAllByTableSessionId(tableSessionId);
    if (members.length === 0) {
      throw new NotFoundException('No session members found for this table');
    }

    const base = Math.floor(grandTotal / members.length);
    const remainder = grandTotal % members.length;

    return members.map((member, index) => ({
      sessionMemberId: member.id,
      amountDue: base + (index < remainder ? 1 : 0),
    }));
  }
}
