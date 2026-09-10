import { StaffUserWithRole } from '@/staff-user/staff-user.repository.interface';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import { StaffUserService } from '@/staff-user/staff-user.service';
import { type JwtPayload } from '@/auth/types/jwt-payload.type';
import { RefreshTokenRepositoryInterface } from '@/auth/refresh-token.repository.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly staffUserService: StaffUserService,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
  ) {}

  async validateStaff(
    email: string,
    pass: string,
  ): Promise<Omit<StaffUserWithRole, 'passwordHash'>> {
    const staff = await this.staffUserService.getByEmailWithPassword(email);

    if (!staff) {
      throw new UnauthorizedException('Invalid Email or Password');
    }

    const isPasswordMatch = await this.bcryptService.compare(
      pass,
      staff.passwordHash,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid Email or Password');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = staff;

    return result;
  }

  signAccessToken(staff: Omit<StaffUserWithRole, 'passwordHash'>): string {
    const payload: JwtPayload = {
      sub: staff.id,
      email: staff.email,
      role: staff.role.code,
    };

    return this.jwtService.sign(payload);
  }

  async issueTokenPair(
    staff: Omit<StaffUserWithRole, 'passwordHash'>,
  ): Promise<TokenPair> {
    const accessToken = this.signAccessToken(staff);
    const refreshToken = await this.issueRefreshToken(staff.id);
    const { exp, iat } = this.jwtService.decode<{ exp: number; iat: number }>(
      accessToken,
    );

    return { accessToken, refreshToken, expiresIn: exp - iat };
  }

  // Rotates the refresh token on every use: the old one is atomically checked
  // and revoked in a single DB call (see revokeIfValid), so a stolen-but-
  // already-used refresh token can never be replayed — including by two
  // concurrent requests racing on the same token.
  async refreshTokens(rawRefreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hashRefreshToken(rawRefreshToken);
    const existing = await this.refreshTokenRepository.revokeIfValid(tokenHash);

    if (!existing) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const staff = await this.staffUserService.getActiveByIdWithRole(
      existing.staffUserId,
    );

    if (!staff) {
      throw new UnauthorizedException('Account is no longer active');
    }

    return this.issueTokenPair(staff);
  }

  // Always succeeds from the caller's point of view — an already-expired or
  // unrecognized refresh token means there's nothing left to revoke.
  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(rawRefreshToken);
    await this.refreshTokenRepository.revokeIfValid(tokenHash);
  }

  private async issueRefreshToken(staffUserId: string): Promise<string> {
    const rawToken = randomBytes(32).toString('hex');
    const refreshExpiresInDays = this.configService.getOrThrow<number>(
      'JWT_REFRESH_EXPIRES_IN_DAYS',
    );
    const expiresAt = new Date(
      Date.now() + refreshExpiresInDays * 24 * 60 * 60 * 1000,
    );

    await this.refreshTokenRepository.create({
      staffUserId,
      tokenHash: this.hashRefreshToken(rawToken),
      expiresAt,
    });

    return rawToken;
  }

  // Refresh tokens are opaque, high-entropy random values (not JWTs), so a
  // deterministic hash — rather than bcrypt — is what lets us look one up by
  // equality while still not storing the raw, bearer-usable secret at rest.
  private hashRefreshToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}
