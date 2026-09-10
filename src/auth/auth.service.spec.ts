import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@/auth/auth.service';
import { StaffUserService } from '@/staff-user/staff-user.service';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import { RefreshTokenRepositoryInterface } from '@/auth/refresh-token.repository.interface';

const staff = {
  id: 'staff-1',
  email: 'staff@example.com',
  role: { id: 'role-STAFF', code: 'STAFF', name: 'STAFF' },
};

const storedRefreshToken = {
  id: 'refresh-1',
  staffUserId: 'staff-1',
  tokenHash: 'irrelevant-in-mocks',
  expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  revokedAt: null,
  createdAt: new Date(),
};

describe('AuthService refresh tokens', () => {
  let service: AuthService;
  let staffUserService: jest.Mocked<StaffUserService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepositoryInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: StaffUserService,
          useValue: { getActiveByIdWithRole: jest.fn() },
        },
        { provide: BcryptService, useValue: {} },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), decode: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue(30) },
        },
        {
          provide: RefreshTokenRepositoryInterface,
          useValue: {
            create: jest.fn(),
            revokeIfValid: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    staffUserService = module.get(StaffUserService);
    jwtService = module.get(JwtService);
    refreshTokenRepository = module.get(RefreshTokenRepositoryInterface);

    jwtService.sign.mockReturnValue('signed-access-token');
    jwtService.decode.mockReturnValue({ iat: 1000, exp: 1900 });
    refreshTokenRepository.create.mockResolvedValue(storedRefreshToken);
  });

  describe('issueTokenPair', () => {
    it('signs an access token and persists a hashed refresh token', async () => {
      const result = await service.issueTokenPair(staff as never);

      expect(result.accessToken).toBe('signed-access-token');
      expect(result.expiresIn).toBe(900);
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(refreshTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ staffUserId: 'staff-1' }),
      );
      // The raw token handed to the caller must never be what's stored.
      expect(refreshTokenRepository.create.mock.calls[0][0].tokenHash).not.toBe(
        result.refreshToken,
      );
    });
  });

  describe('refreshTokens', () => {
    it('rejects an unrecognized, expired, or already-used refresh token', async () => {
      refreshTokenRepository.revokeIfValid.mockResolvedValue(null);

      await expect(service.refreshTokens('bogus')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(staffUserService.getActiveByIdWithRole).not.toHaveBeenCalled();
    });

    it('rejects if the staff account backing an otherwise-valid token is no longer active', async () => {
      refreshTokenRepository.revokeIfValid.mockResolvedValue(
        storedRefreshToken,
      );
      staffUserService.getActiveByIdWithRole.mockResolvedValue(null);

      await expect(service.refreshTokens('raw-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(refreshTokenRepository.create).not.toHaveBeenCalled();
    });

    it('rotates the token and issues a fresh pair for a valid, active staff account', async () => {
      refreshTokenRepository.revokeIfValid.mockResolvedValue(
        storedRefreshToken,
      );
      staffUserService.getActiveByIdWithRole.mockResolvedValue(staff as never);

      const result = await service.refreshTokens('raw-token');

      expect(refreshTokenRepository.revokeIfValid).toHaveBeenCalledTimes(1);
      expect(result.accessToken).toBe('signed-access-token');
      expect(refreshTokenRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('revokes the refresh token when it is still valid', async () => {
      refreshTokenRepository.revokeIfValid.mockResolvedValue(
        storedRefreshToken,
      );

      await service.logout('raw-token');

      expect(refreshTokenRepository.revokeIfValid).toHaveBeenCalledTimes(1);
    });

    it('does nothing (but does not throw) when the refresh token is already invalid', async () => {
      refreshTokenRepository.revokeIfValid.mockResolvedValue(null);

      await expect(service.logout('bogus')).resolves.toBeUndefined();
    });
  });
});
