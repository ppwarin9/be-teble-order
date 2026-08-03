import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { RoleCode } from '@/database/generated/prisma/enums';

function makeContext(user: { role: RoleCode } | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;

  const build = (
    isPublic: boolean | undefined,
    requiredRoles: RoleCode[] | undefined,
  ) => {
    reflector = new Reflector();
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockImplementation((key: string) => {
        if (key === 'isPublic') return isPublic;
        if (key === 'roles') return requiredRoles;
        return undefined;
      });
    return new RolesGuard(reflector);
  };

  it('allows a @Public() route through with no user at all', () => {
    const guard = build(true, ['ADMIN']);
    expect(guard.canActivate(makeContext(undefined))).toBe(true);
  });

  it('allows any authenticated request through when no @Roles() decorator is present', () => {
    const guard = build(false, undefined);
    expect(guard.canActivate(makeContext({ role: 'STAFF' }))).toBe(true);
  });

  it('throws if the route requires roles but the request has no user', () => {
    const guard = build(false, ['ADMIN']);
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(
      ForbiddenException,
    );
  });

  it.each([
    ['STAFF', ['STAFF'], true],
    ['ADMIN', ['STAFF'], true], // ADMIN is above STAFF in the hierarchy
    ['SUPERADMIN', ['STAFF'], true],
    ['STAFF', ['ADMIN'], false], // STAFF is below the required ADMIN level
    ['STAFF', ['SUPERADMIN'], false],
    ['ADMIN', ['SUPERADMIN'], false],
    ['SUPERADMIN', ['SUPERADMIN'], true],
  ])(
    'role %s against @Roles(%s) -> allowed=%s (hierarchy: STAFF < ADMIN < SUPERADMIN)',
    (role, requiredRoles, allowed) => {
      const guard = build(false, requiredRoles as RoleCode[]);
      const context = makeContext({ role: role as RoleCode });

      if (allowed) {
        expect(guard.canActivate(context)).toBe(true);
      } else {
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      }
    },
  );

  it('treats a multi-role @Roles() decorator as "at least the lowest listed level"', () => {
    // @Roles('ADMIN', 'STAFF') means STAFF-or-above may pass (matches
    // admin-order.controller.ts's actual usage).
    const guard = build(false, ['ADMIN', 'STAFF']);
    expect(guard.canActivate(makeContext({ role: 'STAFF' }))).toBe(true);
  });
});
