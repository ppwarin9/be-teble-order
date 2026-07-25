# Controller/Service Refactor Report

**Inspection date:** July 25, 2026
**Scope:** All Controllers and Services in `src/`, **excluding** `src/dining-table/*` (explicitly out of scope per instruction — treated as reference/exception and left untouched).
**Branch:** `feat/store-settings`

---

## 1. Modules Reviewed & Refactored

| Module | Files | Status |
|---|---|---|
| `role` | `role.controller.ts`, `role.service.ts`, `role.repository.ts`, `role.module.ts` | Refactored |
| `staff-user` | `staff-user.controller.ts`, `staff-user.service.ts`, `staff-user.repository.ts`, `staff-user.module.ts` | Refactored |
| `store-setting` | `store-setting.controller.ts`, `store-setting.service.ts`, `store-setting.repository.ts`, `store-setting.module.ts` | Refactored |
| `auth` | `auth.controller.ts`, `auth.service.ts`, `auth.module.ts`, guards, strategy | Refactored |
| `health` | `health.controller.ts`, `health.module.ts` | Refactored |
| `dining-table` | *(all files)* | **Excluded — not modified**, per explicit instruction |

### 1.1 Changes applied

**`role` module**
- `role.controller.ts` / `role.service.ts`: converted relative `./dto/...` imports to standardized `@/role/dto/...` path aliases.
- `role.controller.ts`: added `@ApiBearerAuth()` at the controller level (endpoints sit behind the global `JwtAuthGuard`, but Swagger wasn't documenting the requirement) and added a missing `@ApiBadRequestResponse` on `create()` for validation-failure documentation, matching the pattern already used in `staff-user.controller.ts`.

**`staff-user` module**
- `staff-user.controller.ts` / `staff-user.service.ts`: converted relative `./dto/...` imports to `@/staff-user/dto/...` aliases.
- `staff-user.controller.ts`: added `@ApiBearerAuth()` at the controller level.

**`store-setting` module**
- `store-setting.controller.ts`: added `@ApiBearerAuth()` and a missing `@ApiBadRequestResponse` on `update()`.
- `store-setting.service.ts`: **the service was returning raw Prisma `StoreSetting` entities** instead of `StoreSettingResponseDto` instances (see Issue #1 below). Brought it in line with `role.service.ts` / `staff-user.service.ts` by adding a `toResponseDto()` helper using `plainToInstance(StoreSettingResponseDto, ..., { excludeExtraneousValues: true })`, and updated `get()`/`update()` return types to `Promise<StoreSettingResponseDto>` so the `@Exclude`/`@Expose` contract on the DTO is actually enforced by `ClassSerializerInterceptor`.
- `store-setting.module.ts`: normalized the `StoreSettingRepository` import to the same relative style used for the sibling service/controller in that module (previously mixed relative + alias for files in the same directory).

**`auth` module**
- `auth.controller.ts` / `auth.service.ts`: converted relative `./dto/...` imports to `@/auth/dto/...` aliases.
- `auth.module.ts`: converted `./strategies/jwt.strategy` to `@/auth/strategies/jwt.strategy` alias.
- **Modernization:** replaced the legacy raw `@Request() req: { user: JwtPayload }` param access in `getCurrentStaff()` with a new custom `@CurrentUser()` parameter decorator (`src/auth/decorators/current-user.decorator.ts`), which is the current NestJS-recommended pattern for extracting the authenticated user instead of manually typing the raw Express request.

**`health` module**
- `health.controller.ts`: converted relative parent-traversal imports (`'../common/...'`, `'../database/...'`) and the local `'./dto/health-response.dto'` import to `@/` aliases, removing the only remaining `../`-style imports in the reviewed scope.

### 1.2 Convention applied across all refactors
Standardized on the pattern already implicitly used in the codebase: imports for files in the **same directory** stay relative (`./x.service`), imports crossing into a **subfolder or another module** (`dto/`, `guards/`, `strategies/`, cross-module services) use the `@/` path alias. This mirrors and completes the pattern partially present in the untouched `dining-table` module without altering any of its files.

---

## 2. Issues Detected (logged only — not fixed, per instruction)

### Issue #1 — `dining-table.controller.ts:1` — Unused import (build/lint error)
```
src/dining-table/dining-table.controller.ts
  1:28  error  'Get' is defined but never used  @typescript-eslint/no-unused-vars
```
`Get` is imported from `@nestjs/common` but the controller only defines a `@Post()` handler — no `@Get()` route exists. This is flagged by `npm run lint`. **Not fixed**, since `dining-table.controller.ts` is explicitly out of scope for this task.

### Issue #2 — `src/store-setting/dto/update-store-setting-dto.ts` — Duplicate/shadowing `SplitMethod` type
`update-store-setting-dto.ts:11` declares its own local type:
```ts
export type SplitMethod = 'EQUAL' | 'SINGLE_PAYER';
```
This duplicates the Prisma-generated `SplitMethod` enum already imported and used in `src/store-setting/dto/store-setting-response.dto.ts:1` (`import { SplitMethod } from '@/database/generated/prisma/enums'`). Two independent types with the same name exist in the same module. They currently have matching literal values, so no runtime bug exists today, but if the Prisma schema's `SplitMethod` enum changes, these two definitions can silently drift apart with no compiler error to catch it (the DTO's local type would not track schema changes).

### Issue #3 — `src/store-setting/dto/update-store-setting-dto.ts` — File naming inconsistency
The file is named `update-store-setting-dto.ts`. Every other DTO file in the project follows the `*.dto.ts` suffix convention (e.g. `create-role.dto.ts`, `update-staff-user.dto.ts`, `dining-table-response.dto.ts`). This one is `update-store-setting-dto.ts` (missing the `.` before `dto`), which is inconsistent and was propagated into every import path referencing it (`@/store-setting/dto/update-store-setting-dto`).

### Issue #4 — `src/staff-user/staff-user.service.ts:75-83` — Service method accepts raw Prisma input types instead of a DTO
```ts
async updateStaffUser(
  id: string,
  data: Prisma.StaffUserUpdateInput | Prisma.StaffUserUncheckedUpdateInput,
): Promise<StaffUserResponseDto> {
```
`staff-user.controller.ts` calls this with `updateStaffUserDto: UpdateStaffUserDto` directly. This currently type-checks only because `UpdateStaffUserDto`'s shape happens to be structurally assignable to the Prisma update-input union — there is no explicit mapping/validation boundary between the HTTP-facing DTO and the persistence-layer Prisma type. This is an architectural leak (Prisma types crossing into the service's public signature) rather than a compile error, so `tsc`/`nest build` does not currently flag it, but it is fragile: any future divergence between `UpdateStaffUserDto` and `Prisma.StaffUserUpdateInput` (e.g. renaming a field, adding a relation-only field to the Prisma type) would break this silently or cause a hard-to-trace compile error far from the actual cause.

### Issue #5 — `src/health/health.controller.ts:36-40` — Swagger response DTO doesn't match actual runtime return type
`check()` is documented with `@ApiOkResponse({ type: HealthResponseDto })` but its actual declared/runtime return type is Terminus's `HealthCheckResult`, not an instance of `HealthResponseDto`. `HealthResponseDto` is structurally similar to `HealthCheckResult` and is used purely for Swagger documentation shape — this is a common/acceptable pattern for third-party health-check integrations, but is noted here since it deviates from the "actual class instance backs the documented response type" pattern enforced elsewhere (e.g. `role`, `staff-user`, `store-setting` all now return real DTO instances via `plainToInstance`). No action taken since Terminus does not expose a way to construct `HealthCheckResult` as a custom class instance.

### Build & Lint verification
- `npm run build` (`nest build`) — **passes**, 0 TypeScript errors, both before and after refactor.
- `npm run lint` (`eslint --fix`) — **1 error**, confined to the out-of-scope `dining-table.controller.ts` (Issue #1 above). No errors in any refactored file.

---

## 3. Summary

5 modules (`role`, `staff-user`, `store-setting`, `auth`, `health`) were brought to a consistent standard: `@/` path aliases for all cross-directory imports, `@ApiBearerAuth()` documented on every guarded controller, complete Response-DTO enforcement via `plainToInstance`/`ClassSerializerInterceptor` (closing the gap in `store-setting.service.ts`), and a modern `@CurrentUser()` param decorator replacing raw `@Request()` access in `auth.controller.ts`. `dining-table.controller.ts` and its module were left completely untouched as instructed. Five issues were identified during review and the build/lint pass — all logged above with file/line references and left unfixed per instruction, including one pre-existing lint error inside the excluded `dining-table` module.
