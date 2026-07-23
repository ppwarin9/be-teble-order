# Master Plan Progress Audit (Phase 0–14)

**Date:** 2026-07-23
**Method:** Direct filesystem scan of `c:\Personal-Project\be-table-order` (every file under `src/`, `test/`, `prisma/schema.prisma`, `prisma/migrations/`, `package.json`), plus an actual `npx jest --config ./test/jest-e2e.json` run to verify test infrastructure (not just file existence), and a fresh diff against the previous audit pass (two items were fixed since: `RoleService.findById()` and `AuthService` routing through `StaffUserService`).
**Scope note:** Phases 11–14 are a Next.js frontend (`next.config.ts`, `src/lib/api/real/*`, `(admin)/admin/*` pages, etc.). **No frontend project exists anywhere in this workspace** — this repo is backend-only (NestJS + Prisma). Those phases are reported as not verifiable here, not as "failing."

---

## 1. Overall Completion

| Phase | Scope | Status | Completion |
|---|---|---|---|
| 0 | Bootstrap & Core Infra | ✅ Done | ~100% |
| 1 | Bootstrap Data & Authentication | ⚠️ Partial | ~72% |
| 2 | Master Data: Store Settings | ❌ Not started | 0% |
| 3 | Dining Table & QR | ❌ Not started | 0% |
| 4 | Menu Catalog | ❌ Not started | 0% |
| 5 | Customer Session (Join Table) | ❌ Not started | 0% |
| 6 | Cart | ❌ Not started | 0% |
| 7 | Orders & Admin Queue | ❌ Not started | 0% |
| 8 | Billing & Payments | ❌ Not started | 0% |
| 9 | Admin Dashboard & Reporting | ❌ Not started | 0% |
| 10 | Backend Hardening & Final QA | ❌ Not started | 0% |
| 11 | Frontend Foundation & API Client Wiring | 🚫 N/A here | Not present in this workspace |
| 12 | Frontend Auth Integration | 🚫 N/A here | Not present in this workspace |
| 13 | Frontend Customer Domain Integration | 🚫 N/A here | Not present in this workspace |
| 14 | Frontend Admin Domain Integration | 🚫 N/A here | Not present in this workspace |

**Overall: ~44.5 of ~191 granular micro-tasks done or partially done → ~23% of the full master plan.** All real progress sits in Phases 0–1; Phase 1 itself is well short of done (RBAC and tests are the biggest gaps). The 191 figure is an approximate count since several checklist lines bundle 2–3 actions into one bullet — treat phase-level completion as the reliable signal, not the raw fraction.

---

## 2. 🔴 Items Needing Immediate Attention

1. **Every endpoint is currently unauthenticated.** No `JwtAuthGuard` exists and nothing is wired as a global `APP_GUARD` for auth — `app.module.ts` only registers `ThrottlerGuard`. `POST/GET /roles` and all of `/staff-user` are wide open. Expected *for now* per the plan's own notes, but Phase 1 can't be called done until this closes.

2. ~~JWT payload carries the wrong claim for the RBAC system the plan needs next.~~ **Fixed.** `StaffUserRepository.findByEmail()` now does `include: { role: true }` (return type `StaffUserWithRole = StaffUser & { role: Role }`, exported for reuse), `StaffUserService.findByEmailWithPassword()` and `AuthService.validateStaff()`/`login()` all updated to carry the relation through, and `AuthService.login()` now signs `role: staff.role.code` instead of `staff.roleId`. Verified with `tsc --noEmit` and `eslint` — both clean.

3. **Jest cannot run at all.** Re-confirmed this pass: `npx jest --config ./test/jest-e2e.json` still fails immediately with `Cannot find module './internal/class.js' from '../src/database/generated/prisma/client.ts'`. The Prisma 7 generated client's ESM-style `.js`-suffixed imports collide with `ts-jest`'s CommonJS resolution, and `test/jest-e2e.json` has no `moduleNameMapper` to fix it. Since every repository imports `PrismaService`, this blocks **any** test — unit or e2e — across all 15 phases, not just the testing steps within Phase 1. Highest-leverage fix available in the whole plan.

4. **The Prisma schema has 17 active tables, not the 23 the plan expects — but the other 6 are present, just fully commented out.** Verified: `ModifierGroup`, `ModifierOption`, `MenuItemModifierGroup`, `Promotion`, `CartItemModifier`, `OrderItemModifier` (and their indexes/relations) all exist in `prisma/schema.prisma` as commented-out blocks (17 active + 6 commented = 23, matching the plan's count exactly). This is a *different* implementation of the plan's instruction — the plan says "keep the Modifier/Promotion tables to prevent FK breakage, don't build logic for them," implying they should stay live-but-unused; here they were commented out of the schema entirely, so they were never migrated into the actual database at all. Practically this causes no problems for Phases 2–9 (nothing currently references them, and the junction tables were commented out consistently with their parents), and it's arguably cleaner (no dead models in the generated client) — but it's a real deviation worth knowing about before Phase 13/14 frontend work assumes `modifierGroups` might come back as an empty array vs. not exist on the type at all. Also: `docs/schema.prisma` (the reference file the plan says to copy from) doesn't exist in this repo — only the copied `prisma/schema.prisma` does, which is fine functionally but means there's no checked-in source-of-truth to diff against going forward.

---

## 3. Phase-by-Phase Checklist

### Phase 0 — Bootstrap & Core Infra (✅ ~100%)

- [x] Nest project scaffolded (pnpm, strict TS) — `package.json`/`tsconfig.json` confirm pnpm workspace + strict TS config.
- [x] `@nestjs/config`, `@prisma/client`, `@prisma/adapter-pg`, `prisma`, `class-validator`, `class-transformer` all installed.
- [x] `prisma/schema.prisma` exists, migrated, 17 active models + 6 commented-out (Modifier/Promotion subsystem) = 23 total table definitions. See Critical Item #4 for the nuance on *how* they were kept.
- [x] `npx prisma migrate dev` was run — one migration exists: `prisma/migrations/20260721073245_add_all_table/`. Generated client present at `src/database/generated/prisma/`.
- [x] `src/database/prisma.service.ts` — extends `PrismaClient`, `PrismaPg` adapter, reads `DATABASE_URL` via `ConfigService`.
- [x] `src/database/database.module.ts` — `@Global()`, exports `PrismaService`.
- [x] `src/config/env.validation.ts` — validates `DATABASE_URL`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, wired into `ConfigModule.forRoot({ isGlobal: true, validate })`. ⚠️ Uses **Zod**, not `class-validator` as specified — functionally equivalent, a deliberate deviation from an earlier session.
- [x] `main.ts`: `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`.
- [x] `src/common/filters/prisma-exception.filter.ts` — `@Catch(Prisma.PrismaClientKnownRequestError)`, P2002→409, P2025→404, P2003→400, registered as `APP_FILTER`.
- [x] `helmet` installed, `app.use(helmet())`, `app.enableCors({ origin: process.env.CORS_ORIGIN })`.
- [x] `@nestjs/throttler` installed, `ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])` global default (60000ms = 60s under v6's ms-based API — matches intent).
- [x] `@nestjs/swagger` installed, `/docs` mounted, gated by `NODE_ENV !== 'production'`.
- [x] Health module: `GET /health`, `@Public()` attached, uses Terminus's `PrismaHealthIndicator.pingCheck()` (functionally equivalent to, and more idiomatic than, a hand-written `$queryRaw`SELECT 1``). `@Public()` correctly has no active effect yet — no guard exists (as intended at this stage).

### Phase 1 — Bootstrap Data & Authentication (⚠️ ~70%)

**Role (done):**
- [x] `role.module.ts`/`.service.ts`/`.controller.ts` exist.
- [x] `role.repository.ts`: `findAll()`, `findById(id)`, `create(data)`.
- [x] `create-role.dto.ts`: `code`/`name` both `@IsString @IsNotEmpty`.
- [x] `RoleService.createRole(dto)` → `repository.create()`.
- [x] `RoleService.findAll()` (as `getAllRoles()`) **and** `RoleService.findById()` — both present (fixed this session).
- [x] `POST /roles`, `GET /roles` — both implemented, unguarded (as intended for now).
- [x] `RoleModule` wired into `AppModule`.

**Staff-User (done):**
- [x] `staff-user.module.ts`/`.service.ts`/`.controller.ts`/`.repository.ts` all exist.
- [x] `bcrypt`/`@types/bcrypt` installed; `BcryptService` (saltRounds=12, `hash()`/`compare()`) inside `SecurityModule`.
- [x] `staff-user.repository.ts`: `findByEmail` (filters `isActive:true, deletedAt:null`, now also `include: { role: true }`), `findById`, `findAllActive`, `create`, `update`, `softDelete` — all present, all correctly named.
- [x] `create-staff-user.dto.ts` + `update-staff-user.dto.ts` — both match spec.
- [x] `StaffUserService.findByEmail()` strips `passwordHash`; `AuthService.validateStaff()` now goes through `StaffUserService.findByEmailWithPassword()` (fixed this session — no longer bypasses the service layer).
- [x] `StaffUserService.createStaffUser(dto)` hashes via `bcryptService.hash()` before `repository.create()`; validates `roleId` via `RoleService.findById()` (fixed this session, was reaching into `RoleRepository` directly before).
- [x] `StaffUserService.getAllStaffUsers()`/`getStaffUserById()`/`updateStaffUser()`/`removeStaffUser()` all implemented; soft-delete preserves FKs (`MenuItem.createdBy`/`Bill.issuedBy`/`Payment.confirmedBy`) by never hard-deleting.
- [x] `POST /staff-user`, `GET /staff-user`, `PATCH /staff-user/:id`, `DELETE /staff-user/:id` — all implemented, unguarded (as intended for now).
- [x] `StaffUserModule` wired into `AppModule`.

**Auth (partial — this is where Phase 1 stalls):**
- [x] Auth files exist; `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@types/passport-jwt` installed.
- [x] `src/auth/types/jwt-payload.type.ts` — `{ sub, email, role }`.
- [x] `LoginDto` — `email @IsEmail`, `password @IsString @MinLength(8)`.
- [x] `AuthService.validateStaff()` — matches spec (via the service-layer fix above).
- [x] `AuthService.login()` now signs `role: staff.role.code` (fixed this session — see Critical Item #2).
- [x] `JwtStrategy extends PassportStrategy(Strategy)` — `ExtractJwt.fromAuthHeaderAsBearerToken()`, `ignoreExpiration:false`, secret via `ConfigService.getOrThrow`. ⚠️ `validate(payload)` still returns a remapped `{ id, email, role }`, not the raw payload as specified (minor, harmless deviation — `role` now correctly carries the code string end-to-end).
- [ ] **`JwtAuthGuard extends AuthGuard('jwt')` — does not exist.** No `guards/` folder anywhere in `src/`.
- [x] `POST /auth/login` implemented and working.
- [ ] **`PassportModule.register({ defaultStrategy: 'jwt' })` is not imported anywhere** — only `JwtModule.registerAsync` is wired.
- [ ] **`@Public()` is not attached to `POST /auth/login`** (it *is* correctly attached to `GET /health`). No functional impact yet, but should be added now per the plan's own "prepare it in advance" intent.
- [ ] **`JwtAuthGuard` is not wired as `APP_GUARD`** — see Critical Item #1.
- [ ] **`GET /auth/me` does not exist.**
- [ ] **`@Roles(...codes)` decorator does not exist.**
- [ ] **`RolesGuard implements CanActivate` does not exist.**
- [ ] **No controller has `@Roles(...)` attached** — `/roles` and `/staff-user` have zero role-based restriction.

**Tests (none exist):**
- [ ] `bcrypt.service.spec.ts`, `staff-user.service.spec.ts`, `role.service.spec.ts` — missing.
- [ ] `auth.service.spec.ts` — missing.
- [ ] `test/auth.e2e-spec.ts` — missing.
- ⚠️ Even the *default* `test/app.e2e-spec.ts` (untouched Nest scaffold testing `GET /` → `'Hello World!'`) cannot run — see Critical Item #3 — and would fail its own assertion regardless, since there's no `AppController` anywhere in the project.

### Phases 2–9 — Store Setting, Dining Table, Menu, Session, Cart, Order, Bill, Dashboard/Report (❌ 0% each)

No corresponding directories exist under `src/` for any of: `store-setting`, `dining-table`, `menu`/`menu-category`/`menu-item`, `customer`/`table-session`/`session-member`/`session`, `cart`, `order`/`admin-order`, `bill`/`admin-bill`, `dashboard`/`report`. No `@nestjs/cache-manager`/`cache-manager` installed. No `src/lib/billing` present anywhere in this repo to port `calc.ts`/`split.ts` from (Phase 8 assumes it exists in a frontend/mock codebase not present here). No `@@index([settledAt])`/`@@index([startedAt])` in `schema.prisma` (Phase 9's migration item) — expected, since `Bill`/`OrderItem` group-by-date queries don't exist yet to need them.

Worth noting: **every Prisma model these phases need is already defined and migrated** — `StoreSetting`, `DiningTable`, `MenuCategory`, `MenuItem`, `Customer`, `TableSession`, `SessionMember`, `Cart`, `CartItem`, `OrderRound`, `OrderItem`, `Bill`, `BillDiscount`, `BillShare`, `Payment` all exist with a generated client ready to use. The data layer is fully ready; none of the NestJS application layer (repository/service/controller/DTO) has been built for any of these domains yet.

### Phase 10 — Backend Hardening & Final QA (❌ 0%)

- [ ] `@ApiBearerAuth` — not present anywhere (no bearer auth enforcement exists yet to document). `@ApiTags`/`@ApiOperation` *are* present on the three existing controllers (Auth/Role/Staff-User).
- [ ] `nestjs-pino` — not installed.
- [ ] Cache invalidation review — N/A, no caching exists yet.
- [ ] Rate-limit tuning per route — only the global default (60s/100 req) applies anywhere; no per-route `@Throttle()` overrides exist.
- [ ] `EXPLAIN ANALYZE` pass — N/A, none of the join-heavy queries exist yet.
- [ ] `autocannon` load test — not installed.
- [ ] Full security pass (`@Exclude()` + `ClassSerializerInterceptor` guaranteeing `passwordHash` never serializes) — not implemented. Current protection is a manually-written `excludePassword()` helper in `StaffUserService`, which does work correctly today but isn't the serialization-layer guarantee the plan specifies — a bug in a new endpoint that forgets to call it could still leak the hash. `@Public()` coverage audit — not formally done (informally: 5 of 9 existing endpoints are `@Public`-equivalent by having no guard at all right now, which is a different problem, see Critical Item #1).
- [ ] `docs/postman-collection.json` — does not exist.

### Phases 11–14 — Frontend Integration (🚫 Not verifiable here)

No Next.js project, no `src/lib/api`, no `(admin)/` route group, no `next.config.ts` — nothing frontend-related exists anywhere in this workspace. If a separate frontend repository exists elsewhere, it needs to be audited independently; nothing here confirms or denies its state, including the specific asks in Phase 14 about `admin/modifiers` and `admin/promotions` showing placeholders.

---

## 4. How to Test What's Currently Implemented

Server runs on `http://localhost:9999` (per `.env` `PORT`). Swagger UI: `http://localhost:9999/docs`.

**Note:** since Phase 1's guard/RBAC layer isn't wired yet, every endpoint below is currently open — no `Authorization` header required for anything, including `/roles` and `/staff-user`.

1. **`POST /roles`** — `{ "code": "owner", "name": "Owner" }` → `201`. Repeat same `code` → `409`. Create `manager` and `staff` the same way (no seed script — this is the only way in).
2. **`GET /roles`** — `200`, all three roles. Copy an `id`.
3. **`POST /staff-user`** — `{ "email": "owner@example.com", "password": "password123", "name": "Owner Person", "roleId": "<id>" }` → `201`, no `passwordHash` in response. Invalid `roleId` → `400`. Duplicate email → `409`.
4. **`GET /staff-user`**, **`GET /staff-user/:id`**, **`PATCH /staff-user/:id`**, **`DELETE /staff-user/:id`** — standard CRUD, all working, all unauthenticated.
5. **`POST /auth/login`** — `{ "email": "owner@example.com", "password": "password123" }` → `200` with `access_token` + `user`. Wrong credentials → `401`.
   - ✅ Decode the JWT (e.g. jwt.io) — the `role` claim is now the role's **code** (e.g. `"owner"`), fixed this session.
6. **`GET /health`** — `200`, Terminus report, `database: up`. Stop Postgres, retry → `503`.
7. **Tests** — `npm run test` / `npm run test:e2e` currently fail to even start (Critical Item #3) — worth confirming once before writing any new spec files, since they'll hit the same wall.

---

## 5. Suggested Next Steps (priority order)

1. Fix the Jest/Prisma `.js` module resolution issue (`moduleNameMapper` to strip trailing `.js` on relative imports, or a CJS-compatible Prisma client generation target) — unblocks every testing checklist item in every phase.
2. ~~Add `include: { role: true }`... unblocks RBAC before it's built.~~ **Done.**
3. Build `JwtAuthGuard`, wire it as global `APP_GUARD`, add `@Public()` to `POST /auth/login`, add `GET /auth/me`.
4. Build `@Roles()` + `RolesGuard`, attach to `/roles` and `/staff-user` per the plan's matrix — this closes out Phase 1.
5. Write the Phase 1 unit/e2e specs (now that Jest works and the endpoints are stable), then move to Phase 2 (Store Setting) onward.
