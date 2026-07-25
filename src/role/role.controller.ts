import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from '@/role/dto/create-role.dto';
import { RoleResponseDto } from '@/role/dto/role-response.dto';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Role')
@ApiBearerAuth()
@Controller('admin/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiCreatedResponse({
    description: 'Role created successfully.',
    type: RoleResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiConflictResponse({ description: 'Role code already exists.' })
  create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.roleService.createRole(createRoleDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all available roles' })
  @ApiOkResponse({ description: 'List of roles.', type: [RoleResponseDto] })
  findAll(): Promise<RoleResponseDto[]> {
    return this.roleService.getAllRoles();
  }
}
