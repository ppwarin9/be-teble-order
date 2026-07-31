import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, Role } from '@/database/generated/prisma/client';
import { RoleRepositoryInterface } from '@/role/role.repository.interface';

@Injectable()
export class RoleRepository extends RoleRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(
    data: Prisma.RoleCreateInput | Prisma.RoleUncheckedCreateInput,
  ): Promise<Role> {
    return this.prisma.role.create({ data });
  }

  async getAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async getById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: Prisma.RoleUpdateInput | Prisma.RoleUncheckedUpdateInput,
  ): Promise<Role> {
    return this.prisma.role.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Role> {
    return this.prisma.role.delete({ where: { id } });
  }

  async hasStaffUsers(roleId: string): Promise<boolean> {
    const staffUser = await this.prisma.staffUser.findFirst({
      where: { roleId },
    });
    return !!staffUser;
  }
}
