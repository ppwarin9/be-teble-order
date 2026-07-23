import { Injectable, NotFoundException } from '@nestjs/common';
import { StaffUserRepository } from './staff-user.repository';
import { Prisma, StaffUser } from '@/database/generated/prisma/client';

@Injectable()
export class StaffUserService {
  constructor(private readonly staffUserRepository: StaffUserRepository) {}

  async createStaffUser(
    data: Prisma.StaffUserCreateInput | Prisma.StaffUserUncheckedCreateInput,
  ): Promise<StaffUser> {
    return this.staffUserRepository.create(data);
  }

  async getAllStaffUsers(): Promise<StaffUser[]> {
    return this.staffUserRepository.findAll();
  }

  async findByEmail(email: string): Promise<Omit<StaffUser, 'passwordHash'>> {
    const staff = await this.staffUserRepository.findByEmail(email);

    if (!staff) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานอีเมล ${email} ในระบบ`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = staff;

    return result;
  }

  async getStaffUserById(id: string): Promise<StaffUser> {
    const staff = await this.staffUserRepository.findById(id);

    if (!staff || staff.deletedAt !== null) {
      throw new NotFoundException(`ไม่พบผู้ใช้งาน ID ${id} ในระบบ`);
    }

    return staff;
  }

  async updateStaffUser(
    id: string,
    data: Prisma.StaffUserUpdateInput | Prisma.StaffUserUncheckedUpdateInput,
  ): Promise<StaffUser> {
    await this.getStaffUserById(id);
    return this.staffUserRepository.update(id, data);
  }

  async removeStaffUser(id: string): Promise<StaffUser> {
    await this.getStaffUserById(id);
    return this.staffUserRepository.remove(id);
  }
}
