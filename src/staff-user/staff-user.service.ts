import { StaffUser } from '@/database/generated/prisma/client';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import { RoleService } from '@/role/role.service';
import { CreateStaffUserDto } from '@/staff-user/dto/create-staff-user.dto';
import { UpdateStaffUserDto } from '@/staff-user/dto/update-staff-user.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  StaffUserRepository,
  StaffUserWithRole,
} from './staff-user.repository';

@Injectable()
export class StaffUserService {
  constructor(
    private readonly staffUserRepository: StaffUserRepository,
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

  async getAllStaffUsers(): Promise<StaffUser[]> {
    return this.staffUserRepository.getAll();
  }

  // Includes passwordHash — for AuthService's login check only, never expose via a controller.
  async getByEmailWithPassword(
    email: string,
  ): Promise<StaffUserWithRole | null> {
    return this.staffUserRepository.getByEmail(email);
  }

  async getStaffUserById(id: string): Promise<StaffUser> {
    const staff = await this.staffUserRepository.getById(id);

    if (!staff || staff.deletedAt !== null) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return staff;
  }

  async updateStaffUser(
    id: string,
    dto: UpdateStaffUserDto,
  ): Promise<StaffUser> {
    await this.getStaffUserById(id);

    if (dto.roleId) {
      const role = await this.roleService.getById(dto.roleId);
      if (!role) {
        throw new BadRequestException(`Role (roleId) ${dto.roleId} not found`);
      }
    }

    return this.staffUserRepository.update(id, dto);
  }

  async removeStaffUser(id: string): Promise<StaffUser> {
    await this.getStaffUserById(id);
    return this.staffUserRepository.softDelete(id);
  }
}
