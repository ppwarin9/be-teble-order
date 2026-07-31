import { StaffUserWithRole } from '@/staff-user/staff-user.repository.interface';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import { StaffUserService } from '@/staff-user/staff-user.service';
import { type JwtPayload } from '@/auth/types/jwt-payload.type';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
    const staff = await this.staffUserService.getByEmailWithPassword(email);

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

  signAccessToken(staff: Omit<StaffUserWithRole, 'passwordHash'>): string {
    const payload: JwtPayload = {
      sub: staff.id,
      email: staff.email,
      role: staff.role.code,
    };

    console.log('signAccessToken ');
    return this.jwtService.sign(payload);
  }
}
