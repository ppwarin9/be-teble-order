import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
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
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleService.createRole(createRoleDto);
    return new RoleResponseDto(role);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all available roles' })
  @ApiOkResponse({ description: 'List of roles.', type: [RoleResponseDto] })
  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.roleService.getAllRoles();
    return roles.map((role) => new RoleResponseDto(role));
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiNoContentResponse({ description: 'Role successfully deleted' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiConflictResponse({
    description: 'Cannot delete a role that is still assigned to staff users',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.roleService.deleteRole(id);
  }
}
