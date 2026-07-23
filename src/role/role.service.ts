import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { Role } from '@/database/generated/prisma/client';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async createRole(dto: CreateRoleDto): Promise<Role> {
    return this.roleRepository.create(dto);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }
}
