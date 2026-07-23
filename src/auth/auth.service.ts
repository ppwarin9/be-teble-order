import { StaffUserWithRole } from '@/staff-user/staff-user.repository';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import { StaffUserService } from '@/staff-user/staff-user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { AuthMeResponseDto } from './dto/auth-me-response.dto';
import { type JwtPayload } from '@/auth/types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly staffUserService: StaffUserService,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
  ) {}

  async validateStaff(
    email: string,
    pass: string,
  ): Promise<Omit<StaffUserWithRole, 'passwordHash'>> {
    const staff = await this.staffUserService.findByEmailWithPassword(email);

    if (!staff) {
      throw new UnauthorizedException('Invalid Email or Password');
    }

    const isPasswordMatch = await this.bcryptService.compare(
      pass,
      staff.passwordHash,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid Email or Password');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = staff;

    return result;
  }

  login(staff: Omit<StaffUserWithRole, 'passwordHash'>): AuthLoginResponseDto {
    const payload = {
      sub: staff.id,
      email: staff.email,
      role: staff.role.code,
    };

    return plainToInstance(
      AuthLoginResponseDto,
      {
        accessToken: this.jwtService.sign(payload),
        user: staff,
      },
      { excludeExtraneousValues: true },
    );
  }

  getProfile(payload: JwtPayload): AuthMeResponseDto {
    return plainToInstance(AuthMeResponseDto, payload, {
      excludeExtraneousValues: true,
    });
  }
}
