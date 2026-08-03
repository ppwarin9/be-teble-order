import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';

// Exercises the REAL global guard chain (JwtAuthGuard -> RolesGuard, exactly as wired
// in app.module.ts) end-to-end over real HTTP requests, without booting the full
// AppModule — the full module needs a live DATABASE_URL/Cloudinary/etc. that don't
// exist in this environment. A minimal module with just the auth pieces is enough to
// verify the guard/role behavior itself, which is what this suite is for.
const JWT_SECRET = 'e2e-test-secret';

@Controller('test')
class TestProtectedController {
  @Public()
  @Get('public')
  publicRoute() {
    return { ok: true };
  }

  @Get('any-authenticated')
  anyAuthenticated() {
    return { ok: true };
  }

  @Roles('ADMIN')
  @Get('admin-only')
  adminOnly() {
    return { ok: true };
  }
}

describe('Auth guard chain (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [TestProtectedController],
      providers: [
        JwtStrategy,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    jwtService = moduleFixture.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  const tokenFor = (role: string) =>
    jwtService.sign({ sub: 'user-1', email: 'staff@example.com', role });

  it('allows a @Public() route with no Authorization header', () => {
    return request(app.getHttpServer()).get('/test/public').expect(200);
  });

  it('rejects a protected route with no Authorization header', () => {
    return request(app.getHttpServer())
      .get('/test/any-authenticated')
      .expect(401);
  });

  it('rejects a protected route with a garbage token', () => {
    return request(app.getHttpServer())
      .get('/test/any-authenticated')
      .set('Authorization', 'Bearer not-a-real-jwt')
      .expect(401);
  });

  it('allows a valid token on a route with no @Roles() requirement', () => {
    return request(app.getHttpServer())
      .get('/test/any-authenticated')
      .set('Authorization', `Bearer ${tokenFor('STAFF')}`)
      .expect(200);
  });

  it('rejects a STAFF token on an ADMIN-only route', () => {
    return request(app.getHttpServer())
      .get('/test/admin-only')
      .set('Authorization', `Bearer ${tokenFor('STAFF')}`)
      .expect(403);
  });

  it('allows an ADMIN token on an ADMIN-only route', () => {
    return request(app.getHttpServer())
      .get('/test/admin-only')
      .set('Authorization', `Bearer ${tokenFor('ADMIN')}`)
      .expect(200);
  });

  it('allows a SUPERADMIN token on an ADMIN-only route (hierarchy)', () => {
    return request(app.getHttpServer())
      .get('/test/admin-only')
      .set('Authorization', `Bearer ${tokenFor('SUPERADMIN')}`)
      .expect(200);
  });
});
