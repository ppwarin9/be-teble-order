import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type JwtPayload } from '@/auth/types/jwt-payload.type';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { RoleCode } from '@/database/generated/prisma/enums';

const ROLE_LEVEL: Record<RoleCode, number> = {
  STAFF: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<RoleCode[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: Missing user roles');
    }

    const userLevel = ROLE_LEVEL[user.role] ?? 0;
    const requiredLevel = Math.min(
      ...requiredRoles.map((role) => ROLE_LEVEL[role] ?? Infinity),
    );
    const hasRole = userLevel >= requiredLevel;

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
