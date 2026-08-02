import { RoleCode } from '@/database/generated/prisma/enums';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...codes: RoleCode[]) => SetMetadata(ROLES_KEY, codes);
