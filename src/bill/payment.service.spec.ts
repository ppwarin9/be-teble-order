import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentService } from '@/bill/payment.service';
import { PaymentRepositoryInterface } from '@/bill/payment.repository.interface';
import { BillShareRepositoryInterface } from '@/bill/bill-share.repository.interface';
import { BillRepositoryInterface } from '@/bill/bill.repository.interface';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import { AuthenticatedSessionMember } from '@/auth/types/session.type';

const tableSessionId = 'table-session-1';
const billShareId = 'bill-share-1';

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

const unpaidShare = {
  id: billShareId,
  billId: 'bill-1',
  sessionMemberId: 'member-1',
  amountDue: 10000,
  status: 'UNPAID',
  bill: { id: 'bill-1', tableSessionId },
};

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepository: jest.Mocked<PaymentRepositoryInterface>;
  let billShareRepository: jest.Mocked<BillShareRepositoryInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PaymentRepositoryInterface,
          useValue: {
            create: jest.fn(),
            getById: jest.fn(),
            getActiveForBillShare: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: BillShareRepositoryInterface,
          useValue: {
            getById: jest.fn(),
            updateStatus: jest.fn(),
            areAllSharesPaid: jest.fn(),
          },
        },
        {
          provide: BillRepositoryInterface,
          useValue: { settle: jest.fn() },
        },
        {
          provide: RealtimeGateway,
          useValue: { emitToTableSession: jest.fn(), emitToAdmin: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(PaymentService);
    paymentRepository = module.get(PaymentRepositoryInterface);
    billShareRepository = module.get(BillShareRepositoryInterface);

    billShareRepository.getById.mockResolvedValue(unpaidShare as never);
    billShareRepository.areAllSharesPaid.mockResolvedValue(false);
    paymentRepository.getActiveForBillShare.mockResolvedValue([]);
    paymentRepository.create.mockResolvedValue({ id: 'payment-1' } as never);
  });

  describe('createPayment', () => {
    it('rejects a bill share that does not belong to the requesting session member', async () => {
      billShareRepository.getById.mockResolvedValue({
        ...unpaidShare,
        sessionMemberId: 'someone-else',
      } as never);

      await expect(
        service.createPayment(sessionMember, billShareId, {
          method: 'CASH',
        } as never),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects a bill share that has already been paid', async () => {
      billShareRepository.getById.mockResolvedValue({
        ...unpaidShare,
        status: 'PAID',
      } as never);

      await expect(
        service.createPayment(sessionMember, billShareId, {
          method: 'CASH',
        } as never),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects creating a payment when one is already in progress for this share', async () => {
      paymentRepository.getActiveForBillShare.mockResolvedValue([
        { id: 'existing' },
      ] as never);

      await expect(
        service.createPayment(sessionMember, billShareId, {
          method: 'CASH',
        } as never),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates the payment for the amount already computed on the bill share, ignoring any client-supplied amount', async () => {
      await service.createPayment(sessionMember, billShareId, {
        method: 'CASH',
      } as never);

      expect(paymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ billShareId, amount: unpaidShare.amountDue }),
      );
    });
  });

  describe('markCashPaid', () => {
    it('rejects marking cash-paid when a payment is already in progress (the fix for the audit finding)', async () => {
      paymentRepository.getActiveForBillShare.mockResolvedValue([
        { id: 'pending-promptpay', status: 'PENDING' },
      ] as never);

      await expect(
        service.markCashPaid('staff-1', billShareId),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(paymentRepository.create).not.toHaveBeenCalled();
    });

    it('rejects marking cash-paid on an already-paid share', async () => {
      billShareRepository.getById.mockResolvedValue({
        ...unpaidShare,
        status: 'PAID',
      } as never);

      await expect(
        service.markCashPaid('staff-1', billShareId),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates a CONFIRMED cash payment when nothing is in progress', async () => {
      await service.markCashPaid('staff-1', billShareId);

      expect(paymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          billShareId,
          method: 'CASH',
          status: 'CONFIRMED',
        }),
      );
    });
  });

  describe('notifyPayment', () => {
    it('rejects a payment that does not belong to the requesting session member', async () => {
      paymentRepository.getById.mockResolvedValue({
        id: 'payment-1',
        status: 'PENDING',
        billShareId,
        billShare: { ...unpaidShare, sessionMemberId: 'someone-else' },
      } as never);

      await expect(
        service.notifyPayment(sessionMember, 'payment-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects notifying a payment that is not PENDING', async () => {
      paymentRepository.getById.mockResolvedValue({
        id: 'payment-1',
        status: 'CONFIRMED',
        billShareId,
        billShare: unpaidShare,
      } as never);

      await expect(
        service.notifyPayment(sessionMember, 'payment-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('confirmPayment / failPayment', () => {
    it('throws NotFoundException for a payment that does not exist', async () => {
      paymentRepository.getById.mockResolvedValue(null);

      await expect(
        service.confirmPayment('staff-1', 'missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.failPayment('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects re-confirming an already-confirmed payment', async () => {
      paymentRepository.getById.mockResolvedValue({
        id: 'payment-1',
        status: 'CONFIRMED',
        billShareId,
        billShare: unpaidShare,
      } as never);

      await expect(
        service.confirmPayment('staff-1', 'payment-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });
});
