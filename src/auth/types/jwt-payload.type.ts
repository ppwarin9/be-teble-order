import { RoleCode } from '@/database/generated/prisma/enums';

/** Shape actually encoded into the signed JWT (standard `sub` claim). */
export type JwtPayload = {
  sub: string;
  email: string;
  role: RoleCode;
};

/** Shape of `request.user` after `JwtStrategy.validate()` normalizes the decoded payload. */
export type AuthenticatedUser = {
  id: string;
  email: string;
  role: RoleCode;
};
