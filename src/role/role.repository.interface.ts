import { Prisma, Role } from '@/database/generated/prisma/client';

export abstract class RoleRepositoryInterface {
  abstract getAll(): Promise<Role[]>;

  abstract getById(id: string): Promise<Role | null>;

  abstract update(
    id: string,
    data: Prisma.RoleUpdateInput | Prisma.RoleUncheckedUpdateInput,
  ): Promise<Role>;
}
