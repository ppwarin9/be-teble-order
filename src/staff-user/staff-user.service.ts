import { StaffUser } from '@/database/generated/prisma/client';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import { RoleService } from '@/role/role.service';
import { ChangePasswordDto } from '@/staff-user/dto/change-password.dto';
import { CreateStaffUserDto } from '@/staff-user/dto/create-staff-user.dto';
import { ResetPasswordDto } from '@/staff-user/dto/reset-password.dto';
import { UpdateStaffUserDto } from '@/staff-user/dto/update-staff-user.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RoleCode } from '@/database/generated/prisma/enums';
import {
  StaffUserRepositoryInterface,
  StaffUserWithRole,
} from './staff-user.repository.interface';

@Injectable()
export class StaffUserService {
  constructor(
    private readonly staffUserRepository: StaffUserRepositoryInterface,
    private readonly bcryptService: BcryptService,
    private readonly roleService: RoleService,
  ) {}

  async createStaffUser(dto: CreateStaffUserDto): Promise<StaffUser> {
    const role = await this.roleService.getById(dto.roleId);

    if (!role) {
      throw new BadRequestException(`Role (roleId) ${dto.roleId} not found`);
    }

    const passwordHash = await this.bcryptService.hash(dto.password);

    return this.staffUserRepository.create({
      email: dto.email,
      name: dto.name,
      roleId: dto.roleId,
      passwordHash,
    });
  }

  // ADMIN only sees STAFF-role accounts (they can only reset those passwords);
  // SUPERADMIN sees everyone.
  async getAllStaffUsers(callerRole: RoleCode): Promise<StaffUser[]> {
    const all = await this.staffUserRepository.getAllWithRole();
    if (callerRole === 'SUPERADMIN') {
      return all;
    }
    return all.filter((staff) => staff.role.code === 'STAFF');
  }

  // Includes passwordHash — for AuthService's login check only, never expose via a controller.
  async getByEmailWithPassword(
    email: string,
  ): Promise<StaffUserWithRole | null> {
    return this.staffUserRepository.getByEmail(email);
  }

  async getStaffUserById(id: string, callerRole: RoleCode): Promise<StaffUser> {
    const staff = await this.findByIdWithRoleOrThrow(id);
    if (callerRole !== 'SUPERADMIN' && staff.role.code !== 'STAFF') {
      throw new ForbiddenException('You can only view STAFF-role accounts');
    }
    return staff;
  }

  async updateStaffUser(
    id: string,
    dto: UpdateStaffUserDto,
    currentUserId: string,
  ): Promise<StaffUser> {
    await this.findByIdOrThrow(id);

    if (id === currentUserId && dto.isActive === false) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

    if (dto.roleId) {
      const role = await this.roleService.getById(dto.roleId);
      if (!role) {
        throw new BadRequestException(`Role (roleId) ${dto.roleId} not found`);
      }
    }

    return this.staffUserRepository.update(id, dto);
  }

  async removeStaffUser(id: string, currentUserId: string): Promise<StaffUser> {
    if (id === currentUserId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    await this.findByIdOrThrow(id);
    return this.staffUserRepository.softDelete(id);
  }

  async changeOwnPassword(
    currentUserId: string,
    dto: ChangePasswordDto,
  ): Promise<StaffUser> {
    const staff = await this.findByIdOrThrow(currentUserId);

    const currentPasswordMatches = await this.bcryptService.compare(
      dto.currentPassword,
      staff.passwordHash,
    );
    if (!currentPasswordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await this.bcryptService.hash(dto.newPassword);
    return this.staffUserRepository.update(currentUserId, { passwordHash });
  }

  // ADMIN may only reset STAFF-role passwords; SUPERADMIN may reset anyone's.
  // Resetting your own password is only available via changeOwnPassword.
  async resetPassword(
    targetId: string,
    dto: ResetPasswordDto,
    caller: { id: string; role: RoleCode },
  ): Promise<StaffUser> {
    if (targetId === caller.id) {
      throw new ForbiddenException(
        'Use the change-password endpoint to change your own password',
      );
    }

    const target = await this.findByIdWithRoleOrThrow(targetId);
    if (caller.role !== 'SUPERADMIN' && target.role.code !== 'STAFF') {
      throw new ForbiddenException(
        'You can only reset passwords for STAFF-role accounts',
      );
    }

    const passwordHash = await this.bcryptService.hash(dto.newPassword);
    return this.staffUserRepository.update(targetId, { passwordHash });
  }

  private async findByIdOrThrow(id: string): Promise<StaffUser> {
    const staff = await this.staffUserRepository.getById(id);

    if (!staff) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return staff;
  }

  private async findByIdWithRoleOrThrow(
    id: string,
  ): Promise<StaffUserWithRole> {
    const staff = await this.staffUserRepository.getByIdWithRole(id);

    if (!staff) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return staff;
  }
}
