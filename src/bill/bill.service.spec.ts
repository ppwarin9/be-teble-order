import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BillService } from '@/bill/bill.service';
import { BillRepositoryInterface } from '@/bill/bill.repository.interface';
import { PaymentRepositoryInterface } from '@/bill/payment.repository.interface';
import { SessionMemberRepositoryInterface } from '@/session-member/session-member.repository.interface';
import { StoreSettingService } from '@/store-setting/store-setting.service';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import { AuthenticatedSessionMember } from '@/auth/types/session.type';

const tableSessionId = 'table-session-1';

const sessionMember: AuthenticatedSessionMember = {
  id: 'member-1',
  customerId: 'customer-1',
  tableSessionId,
  tableSession: {
    id: tableSessionId,
    status: 'OPEN',
    diningTableId: 'table-1',
  },
};

const disabledStoreSetting = {
  enableServiceCharge: false,
  serviceChargeRate: 0,
  enableVat: false,
  vatRate: 0,
  currency: 'THB',
};

describe('BillService', () => {
  let service: BillService;
  let billRepository: jest.Mocked<BillRepositoryInterface>;
  let sessionMemberRepository: jest.Mocked<SessionMemberRepositoryInterface>;
  let storeSettingService: jest.Mocked<StoreSettingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillService,
        {
          provide: BillRepositoryInterface,
          useValue: {
            getUnsettledBillForSession: jest.fn(),
            getLastSettledBill: jest.fn(),
            sumOrderItemsSince: jest.fn(),
            createBillWithShares: jest.fn(),
            getById: jest.fn(),
            getAllByTableSessionId: jest.fn(),
            settle: jest.fn(),
          },
        },
        {
          provide: SessionMemberRepositoryInterface,
          useValue: {
            getById: jest.fn(),
            getAllByTableSessionId: jest.fn(),
          },
        },
        {
          provide: StoreSettingService,
          useValue: { get: jest.fn() },
        },
        {
          provide: RealtimeGateway,
          useValue: { emitToTableSession: jest.fn(), emitToAdmin: jest.fn() },
        },
        {
          provide: PaymentRepositoryInterface,
          useValue: { getActiveForBillShare: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(BillService);
    billRepository = module.get(BillRepositoryInterface);
    sessionMemberRepository = module.get(SessionMemberRepositoryInterface);
    storeSettingService = module.get(StoreSettingService);

    billRepository.getUnsettledBillForSession.mockResolvedValue(null);
    billRepository.getLastSettledBill.mockResolvedValue(null);
    storeSettingService.get.mockResolvedValue(disabledStoreSetting as never);
    billRepository.createBillWithShares.mockImplementation((bill, shares) =>
      Promise.resolve({ ...bill, id: 'bill-1', billShares: shares } as never),
    );
  });

  it('rejects generating a bill when an unsettled bill already exists', async () => {
    billRepository.getUnsettledBillForSession.mockResolvedValue({
      id: 'existing-bill',
    } as never);
    billRepository.sumOrderItemsSince.mockResolvedValue(10000);

    await expect(
      service.generateBill(sessionMember, { splitMethod: 'EQUAL' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects generating a bill with nothing billable', async () => {
    billRepository.sumOrderItemsSince.mockResolvedValue(0);

    await expect(
      service.generateBill(sessionMember, { splitMethod: 'EQUAL' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('splits an EQUAL bill evenly, distributing the remainder to the first N members', async () => {
    billRepository.sumOrderItemsSince.mockResolvedValue(10000);
    sessionMemberRepository.getAllByTableSessionId.mockResolvedValue([
      { id: 'member-1' },
      { id: 'member-2' },
      { id: 'member-3' },
    ] as never);

    const bill = await service.generateBill(sessionMember, {
      splitMethod: 'EQUAL',
    });

    // grandTotal 10000 / 3 members -> base 3333, remainder 1 -> first member gets the extra baht
    const amounts = bill.billShares.map(
      (s: { amountDue: number }) => s.amountDue,
    );
    expect(amounts).toEqual([3334, 3333, 3333]);
    expect(amounts.reduce((sum: number, a: number) => sum + a, 0)).toBe(10000);
  });

  it('rejects an EQUAL split when the table session has no members', async () => {
    billRepository.sumOrderItemsSince.mockResolvedValue(10000);
    sessionMemberRepository.getAllByTableSessionId.mockResolvedValue([]);

    await expect(
      service.generateBill(sessionMember, { splitMethod: 'EQUAL' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('defaults a SINGLE_PAYER bill to the requesting member when no payer is specified', async () => {
    billRepository.sumOrderItemsSince.mockResolvedValue(10000);
    sessionMemberRepository.getById.mockResolvedValue({
      id: 'member-1',
      tableSessionId,
    } as never);

    const bill = await service.generateBill(sessionMember, {
      splitMethod: 'SINGLE_PAYER',
    });

    expect(bill.billShares).toEqual([
      { sessionMemberId: 'member-1', amountDue: 10000 },
    ]);
  });

  it('rejects a SINGLE_PAYER bill whose payer belongs to a different table session', async () => {
    billRepository.sumOrderItemsSince.mockResolvedValue(10000);
    sessionMemberRepository.getById.mockResolvedValue({
      id: 'member-9',
      tableSessionId: 'a-different-table-session',
    } as never);

    await expect(
      service.generateBill(sessionMember, {
        splitMethod: 'SINGLE_PAYER',
        payerSessionMemberId: 'member-9',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
