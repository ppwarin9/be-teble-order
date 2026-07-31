import {
  Customer,
  Prisma,
  SessionMember,
  TableSession,
} from '@/database/generated/prisma/client';

export type SessionMemberWithTableSession = SessionMember & {
  tableSession: TableSession;
};

export type SessionMemberWithCustomer = SessionMember & {
  customer: Customer;
};

export abstract class SessionMemberRepositoryInterface {
  abstract findByToken(
    sessionToken: string,
  ): Promise<SessionMemberWithTableSession | null>;

  abstract findOpenMembershipByCustomerId(
    customerId: string,
  ): Promise<SessionMemberWithTableSession | null>;

  abstract findByTableSessionAndCustomer(
    tableSessionId: string,
    customerId: string,
  ): Promise<SessionMember | null>;

  abstract create(
    data: Prisma.SessionMemberUncheckedCreateInput,
  ): Promise<SessionMember>;

  abstract getById(id: string): Promise<SessionMember | null>;

  abstract getAllByTableSessionId(
    tableSessionId: string,
  ): Promise<SessionMemberWithCustomer[]>;
}
