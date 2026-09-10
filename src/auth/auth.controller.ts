import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '@/auth/dto/login.dto';
import { RefreshTokenDto } from '@/auth/dto/refresh-token.dto';
import { AuthLoginResponseDto } from '@/auth/dto/auth-login-response.dto';
import { AuthRefreshResponseDto } from '@/auth/dto/auth-refresh-response.dto';
import { AuthMeResponseDto } from '@/auth/dto/auth-me-response.dto';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { type AuthenticatedUser } from '@/auth/types/jwt-payload.type';
import { StaffUserResponseDto } from '@/staff-user/dto/staff-user-response.dto';
import { StaffUserService } from '@/staff-user/staff-user.service';
import { ChangePasswordDto } from '@/staff-user/dto/change-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly staffUserService: StaffUserService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
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
    const tokens = await this.authService.issueTokenPair(staff);
    return new AuthLoginResponseDto({
      ...tokens,
      user: new StaffUserResponseDto(staff),
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exchange a refresh token for a new access/refresh token pair',
  })
  @ApiOkResponse({
    description: 'The refresh token was valid; here is a new pair.',
    type: AuthRefreshResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token.' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthRefreshResponseDto> {
    const tokens = await this.authService.refreshTokens(dto.refreshToken);
    return new AuthRefreshResponseDto(tokens);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a refresh token' })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  @ApiOperation({ summary: 'Get current logged-in staff profile' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthMeResponseDto })
  @Get('me')
  getCurrentStaff(@CurrentUser() user: AuthenticatedUser): AuthMeResponseDto {
    return new AuthMeResponseDto(user);
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change your own password' })
  @ApiOkResponse({ type: StaffUserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Current password is incorrect.' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<StaffUserResponseDto> {
    const staff = await this.staffUserService.changeOwnPassword(user.id, dto);
    return new StaffUserResponseDto(staff);
  }
}
