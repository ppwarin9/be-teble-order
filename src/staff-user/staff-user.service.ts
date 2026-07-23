import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  StaffUserRepository,
  StaffUserWithRole,
} from './staff-user.repository';
import { Prisma, StaffUser } from '@/database/generated/prisma/client';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import { RoleService } from '@/role/role.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { StaffUserResponseDto } from './dto/staff-user-response.dto';

@Injectable()
export class StaffUserService {
  constructor(
    private readonly staffUserRepository: StaffUserRepository,
    private readonly bcryptService: BcryptService,
    private readonly roleService: RoleService,
  ) {}

  private toResponseDto(staff: StaffUser): StaffUserResponseDto {
    return plainToInstance(StaffUserResponseDto, staff, {
      excludeExtraneousValues: true,
    });
  }

  async createStaffUser(
    dto: CreateStaffUserDto,
  ): Promise<StaffUserResponseDto> {
    const role = await this.roleService.findById(dto.roleId);

    if (!role) {
      throw new BadRequestException(
        `ไม่พบตำแหน่งงาน (roleId) ${dto.roleId} ในระบบ`,
      );
    }

    const passwordHash = await this.bcryptService.hash(dto.password);

    const staff = await this.staffUserRepository.create({
      email: dto.email,
      name: dto.name,
      roleId: dto.roleId,
      passwordHash,
    });

    return this.toResponseDto(staff);
  }

  async getAllStaffUsers(): Promise<StaffUserResponseDto[]> {
    const staffList = await this.staffUserRepository.getAll();

    return staffList.map((staff) => this.toResponseDto(staff));
  }

  // Includes passwordHash — for AuthService's login check only, never expose via a controller.
  async findByEmailWithPassword(
    email: string,
  ): Promise<StaffUserWithRole | null> {
    return this.staffUserRepository.findByEmail(email);
  }

  async getStaffUserById(id: string): Promise<StaffUserResponseDto> {
    const staff = await this.staffUserRepository.findById(id);

    if (!staff || staff.deletedAt !== null) {
      throw new NotFoundException(`ไม่พบผู้ใช้งาน ID ${id} ในระบบ`);
    }

    return this.toResponseDto(staff);
  }

  async updateStaffUser(
    id: string,
    data: Prisma.StaffUserUpdateInput | Prisma.StaffUserUncheckedUpdateInput,
  ): Promise<StaffUserResponseDto> {
    await this.getStaffUserById(id);
    const updated = await this.staffUserRepository.update(id, data);

    return this.toResponseDto(updated);
  }

  async removeStaffUser(id: string): Promise<StaffUserResponseDto> {
    await this.getStaffUserById(id);
    const deleted = await this.staffUserRepository.softDelete(id);

    return this.toResponseDto(deleted);
  }
}
