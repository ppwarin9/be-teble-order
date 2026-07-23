import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RoleRepository } from './role.repository';
import { Role } from '@/database/generated/prisma/client';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async createRole(dto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleRepository.create(dto);

    return plainToInstance(RoleResponseDto, role, {
      excludeExtraneousValues: true,
    });
  }

  async getAllRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.findAll();

    return plainToInstance(RoleResponseDto, roles, {
      excludeExtraneousValues: true,
    });
  }

  // Internal lookup used by StaffUserService to validate a roleId — not exposed via a controller.
  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }
}
