import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { Role } from '@/database/generated/prisma/client';
import { CreateRoleDto } from '@/role/dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async createRole(dto: CreateRoleDto): Promise<Role> {
    return this.roleRepository.create(dto);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.getAll();
  }

  // Internal lookup used by StaffUserService to validate a roleId — not exposed via a controller.
  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.getById(id);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepository.getById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const hasStaffUsers = await this.roleRepository.hasStaffUsers(id);
    if (hasStaffUsers) {
      throw new ConflictException(
        'Cannot delete this role because it is still assigned to one or more staff users',
      );
    }

    await this.roleRepository.delete(id);
  }
}
