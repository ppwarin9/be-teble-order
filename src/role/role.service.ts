import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepositoryInterface } from './role.repository.interface';
import { Role } from '@/database/generated/prisma/client';
import { UpdateRoleDto } from '@/role/dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepositoryInterface) {}

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.getAll();
  }

  async getRoleById(id: string): Promise<Role> {
    return this.findByIdOrThrow(id);
  }

  // Internal lookup used by StaffUserService to validate a roleId — not exposed via a controller.
  async getById(id: string): Promise<Role | null> {
    return this.roleRepository.getById(id);
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    await this.findByIdOrThrow(id);
    return this.roleRepository.update(id, dto);
  }

  private async findByIdOrThrow(id: string): Promise<Role> {
    const role = await this.roleRepository.getById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }
}
