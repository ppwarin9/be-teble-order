import { Prisma, StaffUser } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StaffUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.StaffUserUncheckedCreateInput | Prisma.StaffUserCreateInput,
  ): Promise<StaffUser> {
    return this.prisma.staffUser.create({
      data,
    });
  }

  async findAllActive(): Promise<StaffUser[]> {
    return this.prisma.staffUser.findMany({
      where: { isActive: true, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<StaffUser | null> {
    return this.prisma.staffUser.findFirst({
      where: {
        email,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async findById(id: string): Promise<StaffUser | null> {
    return this.prisma.staffUser.findFirst({
      where: {
        id,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.StaffUserUpdateInput | Prisma.StaffUserUncheckedUpdateInput,
  ): Promise<StaffUser> {
    return this.prisma.staffUser.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<StaffUser> {
    return this.prisma.staffUser.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
