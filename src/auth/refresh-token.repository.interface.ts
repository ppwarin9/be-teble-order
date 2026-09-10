import { RefreshToken } from '@/database/generated/prisma/client';

export type CreateRefreshTokenData = {
  staffUserId: string;
  tokenHash: string;
  expiresAt: Date;
};

export abstract class RefreshTokenRepositoryInterface {
  abstract create(data: CreateRefreshTokenData): Promise<RefreshToken>;

  // Atomically checks validity and revokes in one DB round-trip (an UPDATE ... WHERE,
  // not a separate find-then-revoke) — closes a TOCTOU race where two concurrent calls
  // with the same raw token could otherwise both pass a validity check before either
  // one's revoke lands, letting an already-used refresh token mint two token pairs.
  // Returns the token as it was just before this call revoked it, or null if it was
  // already invalid (revoked, expired, or never existed).
  abstract revokeIfValid(tokenHash: string): Promise<RefreshToken | null>;
}
