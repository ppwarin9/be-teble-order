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
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';
import { StaffUserResponseDto } from './dto/staff-user-response.dto';
import { StaffUserService } from './staff-user.service';

@ApiTags('Staff User')
@Controller('staff-user')
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
  create(
    @Body() createStaffUserDto: CreateStaffUserDto,
  ): Promise<StaffUserResponseDto> {
    return this.staffUserService.createStaffUser(createStaffUserDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all staff users' })
  @ApiOkResponse({
    description: 'List of staff users.',
    type: [StaffUserResponseDto],
  })
  getAll(): Promise<StaffUserResponseDto[]> {
    return this.staffUserService.getAllStaffUsers();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get a staff user by id' })
  @ApiOkResponse({
    description: 'Staff user found.',
    type: StaffUserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Staff user not found.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StaffUserResponseDto> {
    return this.staffUserService.getStaffUserById(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a staff user' })
  @ApiOkResponse({
    description: 'Staff user updated.',
    type: StaffUserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Staff user not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStaffUserDto: UpdateStaffUserDto,
  ): Promise<StaffUserResponseDto> {
    return this.staffUserService.updateStaffUser(id, updateStaffUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Soft-delete a staff user' })
  @ApiOkResponse({
    description: 'Staff user soft-deleted.',
    type: StaffUserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Staff user not found.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StaffUserResponseDto> {
    return this.staffUserService.removeStaffUser(id);
  }
}
