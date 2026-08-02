import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, Role } from '@/database/generated/prisma/client';
import { RoleRepositoryInterface } from '@/role/role.repository.interface';

@Injectable()
export class RoleRepository extends RoleRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
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
}
