import { StaffUser } from '@/database/generated/prisma/client';
import { BcryptService } from '@/shared/security/bcrypt.service';
import { StaffUserRepository } from '@/staff-user/staff-user.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly staffUserRepository: StaffUserRepository,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
  ) {}

  async validateStaff(
    email: string,
    pass: string,
  ): Promise<Omit<StaffUser, 'passwordHash'>> {
    const staff = await this.staffUserRepository.findByEmail(email);

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

  login(staff: Omit<StaffUser, 'passwordHash'>) {
    const payload = {
      sub: staff.id,
      email: staff.email,
      role: staff.roleId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: staff,
    };
  }
}
