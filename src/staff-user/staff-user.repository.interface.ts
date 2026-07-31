import { Prisma, Role, StaffUser } from '@/database/generated/prisma/client';

export type StaffUserWithRole = StaffUser & { role: Role };

export abstract class StaffUserRepositoryInterface {
  abstract create(
    data: Prisma.StaffUserUncheckedCreateInput | Prisma.StaffUserCreateInput,
  ): Promise<StaffUser>;

  abstract getAll(): Promise<StaffUser[]>;

  abstract getByEmail(email: string): Promise<StaffUserWithRole | null>;

  abstract getById(id: string): Promise<StaffUser | null>;

  abstract update(
    id: string,
    data: Prisma.StaffUserUpdateInput | Prisma.StaffUserUncheckedUpdateInput,
  ): Promise<StaffUser>;

  abstract softDelete(id: string): Promise<StaffUser>;
}
