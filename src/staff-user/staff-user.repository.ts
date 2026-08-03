import { Prisma, StaffUser } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import {
  StaffUserRepositoryInterface,
  StaffUserWithRole,
} from '@/staff-user/staff-user.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StaffUserRepository extends StaffUserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(
    data: Prisma.StaffUserUncheckedCreateInput | Prisma.StaffUserCreateInput,
  ): Promise<StaffUser> {
    return this.prisma.staffUser.create({
      data,
    });
  }

  async getAll(): Promise<StaffUser[]> {
    return this.prisma.staffUser.findMany({
      where: { deletedAt: null },
    });
  }

  async getAllWithRole(): Promise<StaffUserWithRole[]> {
    return this.prisma.staffUser.findMany({
      where: { deletedAt: null },
      include: { role: true },
    });
  }

  async getByEmail(email: string): Promise<StaffUserWithRole | null> {
    return this.prisma.staffUser.findFirst({
      where: {
        email,
        isActive: true,
        deletedAt: null,
      },
      include: { role: true },
    });
  }

  async getById(id: string): Promise<StaffUser | null> {
    return this.prisma.staffUser.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async getByIdWithRole(id: string): Promise<StaffUserWithRole | null> {
    return this.prisma.staffUser.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: { role: true },
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
