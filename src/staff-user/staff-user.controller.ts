import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { type AuthenticatedUser } from '@/auth/types/jwt-payload.type';
import { Roles } from '@/common/decorators/roles.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStaffUserDto } from '@/staff-user/dto/create-staff-user.dto';
import { ResetPasswordDto } from '@/staff-user/dto/reset-password.dto';
import { UpdateStaffUserDto } from '@/staff-user/dto/update-staff-user.dto';
import { StaffUserResponseDto } from '@/staff-user/dto/staff-user-response.dto';
import { StaffUserService } from './staff-user.service';

@ApiTags('Staff User')
@ApiBearerAuth()
@Controller('admin/staff-user')
export class StaffUserController {
  constructor(private readonly staffUserService: StaffUserService) {}

  @Post()
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Create a new staff user' })
  @ApiCreatedResponse({
    description: 'Staff user created successfully.',
    type: StaffUserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid roleId.' })
  async create(
    @Body() createStaffUserDto: CreateStaffUserDto,
  ): Promise<StaffUserResponseDto> {
    const staff =
      await this.staffUserService.createStaffUser(createStaffUserDto);
    return new StaffUserResponseDto(staff);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get all staff users',
    description:
      'SUPERADMIN sees every account; ADMIN only sees STAFF-role accounts (the only ones they may reset passwords for).',
  })
  @ApiOkResponse({
    description: 'List of staff users.',
    type: [StaffUserResponseDto],
  })
  async getAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StaffUserResponseDto[]> {
    const staffList = await this.staffUserService.getAllStaffUsers(user.role);
    return staffList.map((staff) => new StaffUserResponseDto(staff));
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get a staff user by id' })
  @ApiOkResponse({
    description: 'Staff user found.',
    type: StaffUserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Staff user not found.' })
  @ApiForbiddenResponse({
    description: 'ADMIN callers may only view STAFF-role accounts.',
  })
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StaffUserResponseDto> {
    const staff = await this.staffUserService.getStaffUserById(id, user.role);
    return new StaffUserResponseDto(staff);
  }

  @Patch(':id')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Update a staff user' })
  @ApiOkResponse({
    description: 'Staff user updated.',
    type: StaffUserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Staff user not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStaffUserDto: UpdateStaffUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StaffUserResponseDto> {
    const staff = await this.staffUserService.updateStaffUser(
      id,
      updateStaffUserDto,
      user.id,
    );
    return new StaffUserResponseDto(staff);
  }

  @Delete(':id')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Soft-delete a staff user' })
  @ApiOkResponse({
    description: 'Staff user soft-deleted.',
    type: StaffUserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Staff user not found.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StaffUserResponseDto> {
    const staff = await this.staffUserService.removeStaffUser(id, user.id);
    return new StaffUserResponseDto(staff);
  }

  @Patch(':id/password')
  @Roles('ADMIN')
  @ApiOperation({
    summary: "Reset another staff user's password",
    description:
      'SUPERADMIN may reset anyone; ADMIN may only reset STAFF-role accounts. Use PATCH /auth/change-password to change your own.',
  })
  @ApiOkResponse({
    description: 'Password reset.',
    type: StaffUserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Staff user not found.' })
  @ApiForbiddenResponse({
    description:
      "Caller lacks permission to reset this account's password, or targeted their own account.",
  })
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StaffUserResponseDto> {
    const staff = await this.staffUserService.resetPassword(id, dto, user);
    return new StaffUserResponseDto(staff);
  }
}
