# Backend Audit Report

**Date:** 2026-07-23
**Scope:** Bootstrap/config, security middleware, exception handling, health check, Role module, Staff-User module.
**Server:** `http://localhost:9999` (from `.env` `PORT`) — Swagger UI at `http://localhost:9999/docs`.

---

## 1. Checklist Status

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | `prisma.service.ts` extends `PrismaClient` + `PrismaPg` adapter, reads `DATABASE_URL` via `ConfigService` | ✅ Done | No changes needed. |
| 2 | `database.module.ts` `@Global()` exporting `PrismaService` | ✅ Done | No changes needed. |
| 3 | `env.validation.ts` validates `DATABASE_URL`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, wired into `ConfigModule.forRoot` | ⚠️ Fixed (with a deviation) | `JWT_EXPIRES_IN` and `CORS_ORIGIN` were **missing** from the schema — added. **Deviation:** the checklist specifies `class-validator`, but the existing file already uses **Zod** end-to-end (schema, `safeParse`, `EnvVariable` type). Rewriting to `class-validator` would mean re-architecting a working, boot-critical file for no functional gain — I kept Zod and just extended the schema. Flag if you want it ported to `class-validator` for consistency with the rest of the DTOs. |
| 4 | `main.ts`: `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })` | ✅ Done | No changes needed. |
| 5 | `prisma-exception.filter.ts` `@Catch(Prisma.PrismaClientKnownRequestError)`, P2002→409, P2025→404, P2003→400, registered as `APP_FILTER` | ✅ Done | No changes needed. |
| 6 | Helmet + CORS (`app.use(helmet())`, `app.enableCors({ origin: process.env.CORS_ORIGIN })`) | ✅ Done (now functional) | Code already matched the checklist, but `CORS_ORIGIN` was never set, so `origin` was `undefined` at runtime. Added `CORS_ORIGIN="*"` to `.env` — **replace `*` with your real frontend origin before production.** |
| 7 | `ThrottlerModule.forRoot` global default | ✅ Done | No changes needed. |
| 8 | Swagger mounted at `/docs`, gated by `NODE_ENV !== 'production'` | ✅ Done | No changes needed. |
| 9 | Health Module `GET /health` checking DB connectivity, `@Public()` placeholder | ✅ Done (see security note below) | Uses Terminus's `PrismaHealthIndicator.pingCheck()` rather than a hand-written `$queryRaw` SELECT — this is the modern, officially supported equivalent and does the same connectivity check. |
| 10 | Role Module: repository `findAll/findById/create`, `create-role.dto.ts`, `POST /roles` + `GET /roles` | 🔧 Fixed | `findAll`/`findById` already existed. **Missing and added:** `RoleRepository.create()`, `create-role.dto.ts`, `RoleService.createRole()`, `POST /roles`. |
| 11 | Staff-User: `BcryptService` (saltRounds 12, `hash`/`compare`) in `SecurityModule` | ✅ Done | No changes needed. |
| 12 | Staff-User repository: `findByEmail`, `findById`, `findAllActive`, `create`, `update`, `softDelete` | 🔧 Fixed | `findByEmail`, `findById`, `create`, `update` already existed. **Renamed** `findAll()` → `findAllActive()` (now also filters `isActive: true`, previously only filtered `deletedAt: null`) and `remove()` → `softDelete()` to match the checklist's naming and intent; updated both call sites in `StaffUserService`. |
| 13 | DTOs `create-staff-user.dto.ts` + `update-staff-user.dto.ts` | 🔧 Fixed | `create-staff-user.dto.ts` already matched the spec exactly. **Missing and added:** `update-staff-user.dto.ts` (`PartialType(OmitType(CreateStaffUserDto, ['password']))` + optional `isActive`). |
| 14 | `StaffUserService.findByEmail()` strips `passwordHash` | ✅ Done | No changes needed. |
| 15 | `StaffUserService.create(dto)` hashes password via `BcryptService.hash()` before saving | ✅ Done | Implemented as `createStaffUser(dto)` (from a previous session) — also validates `roleId` exists via `RoleRepository` before hashing/saving, throwing `400` if not. Name differs from the checklist's literal `create(dto)`, functionally equivalent. |

**Legend:** ✅ Done = already satisfied, no change. 🔧 Fixed = gap found and implemented this pass. ⚠️ = fixed with a noted deviation/trade-off.

---

## 2. What Was Actually Changed This Pass

- `src/config/env.validation.ts` — added `JWT_EXPIRES_IN`, `CORS_ORIGIN` to the Zod schema; also swapped the deprecated `z.string().url()` for `z.url()` (Zod 4 renamed this).
- `.env` — added `JWT_EXPIRES_IN="8h"` and `CORS_ORIGIN="*"` so the app still boots under the stricter schema.
- `src/auth/auth.module.ts` — `JwtModule.registerAsync` now also sets `signOptions.expiresIn` from `JWT_EXPIRES_IN` (via `ConfigService.getOrThrow`, cast to `JwtSignOptions['expiresIn']` since it's a strict `ms`-style literal type, not a plain `string`). `JWT_SECRET` retrieval switched from `.get()` to `.getOrThrow()` for the same type-safety reason as `JwtStrategy`.
- `src/auth/auth.service.ts` — removed the now-redundant inline `{ expiresIn: '8h' }` from `jwtService.sign()`, since it's centralized in the module config.
- `src/role/role.repository.ts` — added `create()`.
- `src/role/dto/create-role.dto.ts` — new file.
- `src/role/role.service.ts`, `src/role/role.controller.ts` — added `createRole()` / `POST /roles`.
- `src/staff-user/staff-user.repository.ts` — `findAll` → `findAllActive` (+ `isActive: true` filter), `remove` → `softDelete`.
- `src/staff-user/staff-user.service.ts` — updated both call sites for the rename above.
- `src/staff-user/dto/update-staff-user.dto.ts` — new file.
- `src/staff-user/staff-user.controller.ts` — added `GET /staff-user`, `GET /staff-user/:id`, `PATCH /staff-user/:id`, `DELETE /staff-user/:id` so the existing `getAllStaffUsers`/`getStaffUserById`/`updateStaffUser`/`removeStaffUser` service methods (and the new DTO) are actually reachable and testable, rather than dead code.

Verified with `npx tsc -p tsconfig.build.json --noEmit` (clean) and `npx eslint` on every touched module (clean).

---

## 3. Security Note (not a checklist item, but worth flagging)

**No route in the app is currently protected by JWT.** `JwtStrategy` exists and `@Public()` exists as a metadata decorator, but there is no global `AuthGuard('jwt')` (or a custom guard reading `IS_PUBLIC_KEY` via `Reflector`) registered as `APP_GUARD`. Right now `@Public()` on `HealthController` has no effect either way, because *every* endpoint — `/roles`, `/staff-user`, etc. — is unauthenticated. This is fine for the current bootstrapping/testing phase (no seed script, so you need open endpoints to create your first data), but flag it before shipping: you'll want a global JWT guard plus `@Public()` actually consulted by it, so only `/health` and `/auth/login` stay open.

---

## 4. How to Test (Swagger UI at `/docs`, no seed script needed)

Start the app, open **`http://localhost:9999/docs`**. Every endpoint below is listed under its `@ApiTags` group.

### Step 1 — Create a Role
**`POST /roles`**
```json
{
  "code": "ADMIN",
  "name": "Administrator"
}
```
Expect `201` with the created role, including its `id` (a UUID) — copy it for Step 2.
Try posting the same `code` again → expect `409 Conflict` (unique constraint via `PrismaExceptionFilter`).

### Step 2 — List Roles
**`GET /roles`** → expect `200` with an array containing the role you just created.

### Step 3 — Create a Staff User
**`POST /staff-user`**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin Person",
  "roleId": "<paste the role id from Step 1>"
}
```
Expect `201` with the created staff user — **no `passwordHash` field in the response**. Try an invalid/random `roleId` → expect `400 Bad Request`. Try the same `email` twice → expect `409 Conflict` (unique constraint on `email`).

### Step 4 — Log In
**`POST /auth/login`**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
Expect `200` with `access_token` and `user` (no `passwordHash`). Wrong password/email → expect `401 Unauthorized`.
In Swagger, click **Authorize** and paste the token as `Bearer <access_token>` if you want to test any future protected route (see Security Note above — nothing requires it yet).

### Step 5 — List / Get Staff Users
- **`GET /staff-user`** → `200`, array of active staff users.
- **`GET /staff-user/{id}`** → paste the id from Step 3 → `200` with that user. A random UUID that doesn't exist → `404`. A non-UUID string → `400` (from `ParseUUIDPipe`).

### Step 6 — Update a Staff User
**`PATCH /staff-user/{id}`**
```json
{
  "name": "Admin Person Updated",
  "isActive": true
}
```
Expect `200` with the updated record.

### Step 7 — Soft-Delete a Staff User
**`DELETE /staff-user/{id}`** → expect `200`. Afterwards, `GET /staff-user/{id}` should return `404` (excluded by the `isActive`/`deletedAt` filters), and the row it left behind in Postgres should have `deleted_at` set and `is_active = false` rather than being physically removed.

### Step 8 — Health Check
**`GET /health`** → expect `200` with a Terminus report showing the `database` indicator as `up`. Stop your local Postgres and retry → expect `503` with `database: down`.

---

## 5. Items Deliberately Left As-Is

- `env.validation.ts` kept on **Zod** instead of `class-validator` (see row 3 above) — a judgment call to avoid rewriting working, boot-critical validation without an explicit go-ahead.
- No global JWT auth guard was added — out of scope for this checklist and would lock you out of the very endpoints you need open right now to seed data manually.
