import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { StaffUserService } from '@/staff-user/staff-user.service';
import { StaffUserRepositoryInterface } from '@/staff-user/staff-user.repository.interface';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import { RoleService } from '@/role/role.service';

const staffMember = (
  id: string,
  roleCode: 'STAFF' | 'ADMIN' | 'SUPERADMIN',
) => ({
  id,
  passwordHash: 'hashed-current-password',
  role: { id: `role-${roleCode}`, code: roleCode, name: roleCode },
});

describe('StaffUserService password management', () => {
  let service: StaffUserService;
  let staffUserRepository: jest.Mocked<StaffUserRepositoryInterface>;
  let bcryptService: jest.Mocked<BcryptService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffUserService,
        {
          provide: StaffUserRepositoryInterface,
          useValue: {
            getById: jest.fn(),
            getByIdWithRole: jest.fn(),
            getAllWithRole: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: BcryptService,
          useValue: { compare: jest.fn(), hash: jest.fn() },
        },
        { provide: RoleService, useValue: { getById: jest.fn() } },
      ],
    }).compile();

    service = module.get(StaffUserService);
    staffUserRepository = module.get(StaffUserRepositoryInterface);
    bcryptService = module.get(BcryptService);

    bcryptService.hash.mockResolvedValue('new-hashed-password');
    staffUserRepository.update.mockResolvedValue({ id: 'updated' } as never);
  });

  describe('changeOwnPassword', () => {
    it('rejects an incorrect current password', async () => {
      staffUserRepository.getById.mockResolvedValue(
        staffMember('staff-1', 'STAFF') as never,
      );
      bcryptService.compare.mockResolvedValue(false);

      await expect(
        service.changeOwnPassword('staff-1', {
          currentPassword: 'wrong',
          newPassword: 'newpassword123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(staffUserRepository.update).not.toHaveBeenCalled();
    });

    it('updates the password hash when the current password is correct', async () => {
      staffUserRepository.getById.mockResolvedValue(
        staffMember('staff-1', 'STAFF') as never,
      );
      bcryptService.compare.mockResolvedValue(true);

      await service.changeOwnPassword('staff-1', {
        currentPassword: 'correct',
        newPassword: 'newpassword123',
      });

      expect(staffUserRepository.update).toHaveBeenCalledWith('staff-1', {
        passwordHash: 'new-hashed-password',
      });
    });
  });

  describe('resetPassword (administrative reset)', () => {
    it('rejects resetting your own password through this path', async () => {
      await expect(
        service.resetPassword(
          'admin-1',
          { newPassword: 'newpassword123' },
          { id: 'admin-1', role: 'ADMIN' },
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('allows ADMIN to reset a STAFF-role account', async () => {
      staffUserRepository.getByIdWithRole.mockResolvedValue(
        staffMember('staff-1', 'STAFF') as never,
      );

      await service.resetPassword(
        'staff-1',
        { newPassword: 'newpassword123' },
        { id: 'admin-1', role: 'ADMIN' },
      );

      expect(staffUserRepository.update).toHaveBeenCalledWith('staff-1', {
        passwordHash: 'new-hashed-password',
      });
    });

    it.each(['ADMIN', 'SUPERADMIN'] as const)(
      'rejects ADMIN resetting another %s-role account',
      async (targetRole) => {
        staffUserRepository.getByIdWithRole.mockResolvedValue(
          staffMember('target-1', targetRole) as never,
        );

        await expect(
          service.resetPassword(
            'target-1',
            { newPassword: 'newpassword123' },
            { id: 'admin-1', role: 'ADMIN' },
          ),
        ).rejects.toBeInstanceOf(ForbiddenException);
      },
    );

    it.each(['STAFF', 'ADMIN', 'SUPERADMIN'] as const)(
      'allows SUPERADMIN to reset a %s-role account',
      async (targetRole) => {
        staffUserRepository.getByIdWithRole.mockResolvedValue(
          staffMember('target-1', targetRole) as never,
        );

        await service.resetPassword(
          'target-1',
          { newPassword: 'newpassword123' },
          { id: 'superadmin-1', role: 'SUPERADMIN' },
        );

        expect(staffUserRepository.update).toHaveBeenCalledWith('target-1', {
          passwordHash: 'new-hashed-password',
        });
      },
    );
  });

  describe('getAllStaffUsers visibility', () => {
    it('shows ADMIN callers only STAFF-role accounts', async () => {
      staffUserRepository.getAllWithRole.mockResolvedValue([
        staffMember('s1', 'STAFF'),
        staffMember('a1', 'ADMIN'),
        staffMember('sa1', 'SUPERADMIN'),
      ] as never);

      const result = await service.getAllStaffUsers('ADMIN');

      expect(result.map((s) => s.id)).toEqual(['s1']);
    });

    it('shows SUPERADMIN callers every account', async () => {
      staffUserRepository.getAllWithRole.mockResolvedValue([
        staffMember('s1', 'STAFF'),
        staffMember('a1', 'ADMIN'),
        staffMember('sa1', 'SUPERADMIN'),
      ] as never);

      const result = await service.getAllStaffUsers('SUPERADMIN');

      expect(result.map((s) => s.id)).toEqual(['s1', 'a1', 'sa1']);
    });
  });
});
