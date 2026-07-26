import { SessionStatus } from '@/database/generated/prisma/enums';

/** Shape attached to `request.sessionMember` by `SessionTokenGuard`. */
export type AuthenticatedSessionMember = {
  id: string;
  customerId: string;
  tableSessionId: string;
  tableSession: {
    id: string;
    status: SessionStatus;
    diningTableId: string;
  };
};
