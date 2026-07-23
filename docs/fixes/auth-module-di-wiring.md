# สรุปการแก้ไข: เชื่อมต่อ Dependency ใน AuthModule

**วันที่:** 2026-07-23
**ไฟล์ที่แก้:** `src/auth/auth.module.ts`, `src/auth/auth.service.ts`

## บริบท

จาก Code Review พบว่า `AuthModule` ยังไม่ได้เชื่อมต่อ dependency ที่ `AuthService`
ต้องใช้จริง ทำให้แอปจะ crash ทันทีตอน bootstrap ก่อนแก้ไขในรอบนี้

## 1. `src/auth/auth.module.ts` — เพิ่ม `imports` ที่ขาดหายไป

**ปัญหา:** `AuthModule` ไม่มี `imports` array เลย ทั้งที่ `AuthService` inject
`StaffUserRepository`, `BcryptService` และ `JwtService` เข้ามาใช้งาน (ดู
`src/auth/auth.service.ts:9-13`) แต่ไม่มีโมดูลไหน export ของพวกนี้เข้ามาให้เลย
ผลคือ Nest จะ throw ตอน bootstrap:

```
Nest can't resolve dependencies of the AuthService (?, ?, ?)
```

นอกจากนี้ `JwtModule` ไม่เคยถูก register ที่ไหนเลยในทั้งโปรเจกต์ ทั้งที่
`JWT_SECRET` มีการ validate ไว้แล้วใน `src/config/env.validation.ts` — แปลว่ามี
เจตนาจะใช้ค่านี้อยู่แล้ว แต่ไม่มีจุดไหนเอาไปต่อสาย

**แก้ไข:**

```ts
@Module({
  imports: [
    SecurityModule, // export BcryptService
    StaffUserModule, // export StaffUserRepository
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

**ทำไมใช้ `registerAsync` แทน `register`:** เพื่อดึงค่า secret ผ่าน
`ConfigService` แทนการ hardcode string ใน source code — เป็นแนวทางมาตรฐานของ
NestJS 10+/11 สำหรับ config ที่มาจาก environment variable และสอดคล้องกับ
`ConfigModule` ที่ตั้งเป็น global อยู่แล้วใน `app.module.ts`

## 2. `src/auth/auth.service.ts` — แก้ unused variable ให้ตรง pattern เดิม

**ปัญหา:** บรรทัด

```ts
const { passwordHash, ...result } = staff;
```

ปล่อยตัวแปร `passwordHash` ไว้โดยไม่ได้ใช้ ซึ่งจะโดน ESLint rule
`@typescript-eslint/no-unused-vars` เตือน เพราะ `eslint.config.mjs` ไม่ได้ตั้ง
`ignoreRestSiblings` ไว้ — จุดเดียวกันนี้เคยเกิดใน
`src/staff-user/staff-user.service.ts:26` มาก่อน และถูกแก้ด้วยการ rename เป็น
`_` พร้อม eslint-disable comment ไปแล้ว

**แก้ไข:** ทำให้ตรงกับ pattern เดิมที่ใช้อยู่แล้วในโปรเจกต์

```ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { passwordHash: _, ...result } = staff;
```

## ยืนยันผลลัพธ์

รัน `npx tsc -p tsconfig.build.json --noEmit` แล้ว error ที่เหลือมีเฉพาะใน
`auth.controller.ts` (5 จุด: `create/findAll/findOne/update/remove` ไม่มีบน
`AuthService`) ซึ่งเป็นไฟล์ scaffold เดิมจาก `nest g resource auth` — **ตั้งใจ
ไม่แตะไฟล์นี้ในรอบนี้** ตามที่ตกลงกันไว้ว่าจะเขียนใหม่พร้อมกับ `JwtStrategy` ใน
สเต็ปถัดไป

## ยังไม่ได้แก้ (ของสเต็ปถัดไป)

- `src/auth/auth.controller.ts` ยังเป็น scaffold เดิม ต้องเขียนใหม่ให้เรียก
  `authService.login()` จริงและรับ `LoginDto`
- ยังไม่มี `JwtStrategy` / `LocalStrategy` — คือของที่จะทำต่อ

## 3. `src/auth/auth.service.ts` — เอา `async` ที่ไม่จำเป็นออกจาก `login`

**ปัญหา:** IDE เตือน "Async method 'login' has no 'await' expression" เพราะ
`login()` ถูกประกาศเป็น `async` แต่ข้างในไม่มี `await` เลย —
`this.jwtService.sign(...)` เป็นฟังก์ชัน **synchronous** (มีแค่
`signAsync()` เท่านั้นที่คืน Promise) การใส่ `async` เฉยๆ จะห่อ return value
ด้วย `Promise` แบบไม่จำเป็น เปลือง microtask โดยไม่มีประโยชน์

**แก้ไข:**

```ts
// ก่อน
async login(staff: Omit<StaffUser, 'passwordHash'>) { ... }

// หลัง
login(staff: Omit<StaffUser, 'passwordHash'>) { ... }
```

Nest รองรับทั้ง return แบบ sync และ Promise อยู่แล้วในทุก layer (service/
controller) จึงไม่กระทบ behavior ใดๆ — ตรวจสอบด้วย `tsc --noEmit` แล้วว่า error
ที่เหลือยังเป็นแค่ `auth.controller.ts` เหมือนเดิม ไม่มี error ใหม่เพิ่มจาก
การแก้จุดนี้
