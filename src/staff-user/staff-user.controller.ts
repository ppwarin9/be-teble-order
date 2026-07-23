import { Roles } from '@/common/decorators/roles.decorator';
import { StaffUser } from '@/database/generated/prisma/client';
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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';
import { StaffUserService } from './staff-user.service';

@ApiTags('Staff User')
@Controller('staff-user')
export class StaffUserController {
  constructor(private readonly staffUserService: StaffUserService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new staff user' })
  @ApiResponse({
    status: 201,
    description: 'Staff user created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid roleId.' })
  create(
    @Body() createStaffUserDto: CreateStaffUserDto,
  ): Promise<Omit<StaffUser, 'passwordHash'>> {
    return this.staffUserService.createStaffUser(createStaffUserDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all staff users' })
  @ApiResponse({ status: 200, description: 'List of staff users.' })
  getAll(): Promise<Omit<StaffUser, 'passwordHash'>[]> {
    return this.staffUserService.getAllStaffUsers();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get a staff user by id' })
  @ApiResponse({ status: 200, description: 'Staff user found.' })
  @ApiResponse({ status: 404, description: 'Staff user not found.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Omit<StaffUser, 'passwordHash'>> {
    return this.staffUserService.getStaffUserById(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a staff user' })
  @ApiResponse({ status: 200, description: 'Staff user updated.' })
  @ApiResponse({ status: 404, description: 'Staff user not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStaffUserDto: UpdateStaffUserDto,
  ): Promise<Omit<StaffUser, 'passwordHash'>> {
    return this.staffUserService.updateStaffUser(id, updateStaffUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Soft-delete a staff user' })
  @ApiResponse({ status: 200, description: 'Staff user soft-deleted.' })
  @ApiResponse({ status: 404, description: 'Staff user not found.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Omit<StaffUser, 'passwordHash'>> {
    return this.staffUserService.removeStaffUser(id);
  }
}
