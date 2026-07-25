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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStaffUserDto } from '@/staff-user/dto/create-staff-user.dto';
import { UpdateStaffUserDto } from '@/staff-user/dto/update-staff-user.dto';
import { StaffUserResponseDto } from '@/staff-user/dto/staff-user-response.dto';
import { StaffUserService } from './staff-user.service';

@ApiTags('Staff User')
@ApiBearerAuth()
@Controller('admin/staff-user')
export class StaffUserController {
  constructor(private readonly staffUserService: StaffUserService) {}

  @Post()
  @Roles('ADMIN')
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
  @ApiOperation({ summary: 'Get all staff users' })
  @ApiOkResponse({
    description: 'List of staff users.',
    type: [StaffUserResponseDto],
  })
  async getAll(): Promise<StaffUserResponseDto[]> {
    const staffList = await this.staffUserService.getAllStaffUsers();
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
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StaffUserResponseDto> {
    const staff = await this.staffUserService.getStaffUserById(id);
    return new StaffUserResponseDto(staff);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a staff user' })
  @ApiOkResponse({
    description: 'Staff user updated.',
    type: StaffUserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Staff user not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStaffUserDto: UpdateStaffUserDto,
  ): Promise<StaffUserResponseDto> {
    const staff = await this.staffUserService.updateStaffUser(
      id,
      updateStaffUserDto,
    );
    return new StaffUserResponseDto(staff);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Soft-delete a staff user' })
  @ApiOkResponse({
    description: 'Staff user soft-deleted.',
    type: StaffUserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Staff user not found.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StaffUserResponseDto> {
    const staff = await this.staffUserService.removeStaffUser(id);
    return new StaffUserResponseDto(staff);
  }
}
