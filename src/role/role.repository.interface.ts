import { Prisma, Role } from '@/database/generated/prisma/client';

export abstract class RoleRepositoryInterface {
  abstract create(
    data: Prisma.RoleCreateInput | Prisma.RoleUncheckedCreateInput,
  ): Promise<Role>;

  abstract getAll(): Promise<Role[]>;

  abstract getById(id: string): Promise<Role | null>;

  abstract update(
    id: string,
    data: Prisma.RoleUpdateInput | Prisma.RoleUncheckedUpdateInput,
  ): Promise<Role>;

  abstract delete(id: string): Promise<Role>;

  abstract hasStaffUsers(roleId: string): Promise<boolean>;
}
