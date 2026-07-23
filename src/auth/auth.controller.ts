import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { AuthMeResponseDto } from './dto/auth-me-response.dto';
import { Public } from '@/common/decorators/public.decorator';
import { type JwtPayload } from '@/auth/types/jwt-payload.type';

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
    const validStaff = await this.authService.validateStaff(
      loginDto.email,
      loginDto.password,
    );

    return this.authService.login(validStaff);
  }

  @ApiOperation({ summary: 'Get current logged-in staff profile' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthMeResponseDto })
  @Get('me')
  getCurrentStaff(@Request() req: { user: JwtPayload }): AuthMeResponseDto {
    return this.authService.getProfile(req.user);
  }
}
