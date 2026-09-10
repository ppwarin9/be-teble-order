import { RefreshToken } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateRefreshTokenData,
  RefreshTokenRepositoryInterface,
} from '@/auth/refresh-token.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenRepository extends RefreshTokenRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  async revokeIfValid(tokenHash: string): Promise<RefreshToken | null> {
    // updateMany's WHERE is evaluated and applied atomically by Postgres — a second,
    // concurrent call with the same tokenHash matches zero rows once the first one has
    // set revokedAt, so only one caller ever sees a non-null result for a given token.
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      data: { revokedAt: new Date() },
    });

    if (count === 0) {
      return null;
    }

    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }
}
