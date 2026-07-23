import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  StaffUserRepository,
  StaffUserWithRole,
} from './staff-user.repository';
import { Prisma, StaffUser } from '@/database/generated/prisma/client';
import { BcryptService } from '@/shared/security/bcrypt.service';
import { RoleService } from '@/role/role.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';

@Injectable()
export class StaffUserService {
  constructor(
    private readonly staffUserRepository: StaffUserRepository,
    private readonly bcryptService: BcryptService,
    private readonly roleService: RoleService,
  ) {}

  private excludePassword(staff: StaffUser): Omit<StaffUser, 'passwordHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = staff;
    return result;
  }

  async createStaffUser(
    dto: CreateStaffUserDto,
  ): Promise<Omit<StaffUser, 'passwordHash'>> {
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

    return this.excludePassword(staff);
  }

  async getAllStaffUsers(): Promise<Omit<StaffUser, 'passwordHash'>[]> {
    const staffList = await this.staffUserRepository.getAll();

    return staffList.map((staff) => this.excludePassword(staff));
  }

  // Includes passwordHash — for AuthService's login check only, never expose via a controller.
  async findByEmailWithPassword(
    email: string,
  ): Promise<StaffUserWithRole | null> {
    return this.staffUserRepository.findByEmail(email);
  }

  async findByEmail(email: string): Promise<Omit<StaffUser, 'passwordHash'>> {
    const staff = await this.staffUserRepository.findByEmail(email);

    if (!staff) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานอีเมล ${email} ในระบบ`);
    }

    return this.excludePassword(staff);
  }

  async getStaffUserById(id: string): Promise<Omit<StaffUser, 'passwordHash'>> {
    const staff = await this.staffUserRepository.findById(id);

    if (!staff || staff.deletedAt !== null) {
      throw new NotFoundException(`ไม่พบผู้ใช้งาน ID ${id} ในระบบ`);
    }

    return this.excludePassword(staff);
  }

  async updateStaffUser(
    id: string,
    data: Prisma.StaffUserUpdateInput | Prisma.StaffUserUncheckedUpdateInput,
  ): Promise<Omit<StaffUser, 'passwordHash'>> {
    await this.getStaffUserById(id);
    const updated = await this.staffUserRepository.update(id, data);

    return this.excludePassword(updated);
  }

  async removeStaffUser(id: string): Promise<Omit<StaffUser, 'passwordHash'>> {
    await this.getStaffUserById(id);
    const deleted = await this.staffUserRepository.softDelete(id);

    return this.excludePassword(deleted);
  }
}
