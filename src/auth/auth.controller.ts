import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { StaffUser } from '@/database/generated/prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Staff login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful, returns access token and staff profile.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid email or password.',
  })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ access_token: string; user: Omit<StaffUser, 'passwordHash'> }> {
    const validStaff = await this.authService.validateStaff(
      loginDto.email,
      loginDto.password,
    );

    return this.authService.login(validStaff);
  }
}
