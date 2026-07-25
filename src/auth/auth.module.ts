import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { HashModule } from '@/infrastructure/hash/hash.module';
import { JwtModule } from '@/infrastructure/jwt/jwt.module';
import { StaffUserModule } from '@/staff-user/staff-user.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    HashModule,
    StaffUserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
