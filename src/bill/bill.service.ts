import { AuthenticatedSessionMember } from '@/auth/types/session.type';
import {
  BillRepositoryInterface,
  BillWithShares,
  NewBillShareInput,
} from '@/bill/bill.repository.interface';
import { GenerateBillDto } from '@/bill/dto/generate-bill.dto';
import { SessionMemberRepositoryInterface } from '@/session-member/session-member.repository.interface';
import { StoreSettingService } from '@/store-setting/store-setting.service';
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

    return this.repository.createBillWithShares(
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
  }

  async getBillsForSession(
    sessionMember: AuthenticatedSessionMember,
  ): Promise<BillWithShares[]> {
    return this.repository.getAllByTableSessionId(sessionMember.tableSessionId);
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
