import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '@/auth/dto/login.dto';
import { AuthLoginResponseDto } from '@/auth/dto/auth-login-response.dto';
import { AuthMeResponseDto } from '@/auth/dto/auth-me-response.dto';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { type AuthenticatedUser } from '@/auth/types/jwt-payload.type';
import { StaffUserResponseDto } from '@/staff-user/dto/staff-user-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Staff login with email and password' })
  @ApiOkResponse({
    description: 'Login successful, returns access token and staff profile.',
    type: AuthLoginResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  async login(@Body() loginDto: LoginDto): Promise<AuthLoginResponseDto> {
    const staff = await this.authService.validateStaff(
      loginDto.email,
      loginDto.password,
    );
    const accessToken = this.authService.signAccessToken(staff);

    return new AuthLoginResponseDto({
      accessToken,
      user: new StaffUserResponseDto(staff),
    });
  }

  @ApiOperation({ summary: 'Get current logged-in staff profile' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthMeResponseDto })
  @Get('me')
  getCurrentStaff(@CurrentUser() user: AuthenticatedUser): AuthMeResponseDto {
    return new AuthMeResponseDto(user);
  }
}
