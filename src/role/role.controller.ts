import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from '@/database/generated/prisma/client';

@ApiTags('Role')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully.' })
  @ApiResponse({ status: 409, description: 'Role code already exists.' })
  create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.createRole(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all available roles' })
  @ApiResponse({ status: 200, description: 'List of roles.' })
  findAll(): Promise<Role[]> {
    return this.roleService.getAllRoles();
  }
}
