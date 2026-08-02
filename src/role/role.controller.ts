import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Body,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { UpdateRoleDto } from '@/role/dto/update-role.dto';
import { RoleResponseDto } from '@/role/dto/role-response.dto';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Role')
@ApiBearerAuth()
@Controller('admin/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Get all available roles' })
  @ApiOkResponse({ description: 'List of roles.', type: [RoleResponseDto] })
  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.roleService.getAllRoles();
    return roles.map((role) => new RoleResponseDto(role));
  }

  @Get(':id')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Get a role by id' })
  @ApiOkResponse({ description: 'Role found.', type: RoleResponseDto })
  @ApiNotFoundResponse({ description: 'Role not found.' })
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RoleResponseDto> {
    const role = await this.roleService.getRoleById(id);
    return new RoleResponseDto(role);
  }

  @Patch(':id')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Rename a role (code is fixed, not editable)' })
  @ApiOkResponse({ description: 'Role updated.', type: RoleResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiNotFoundResponse({ description: 'Role not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.roleService.updateRole(id, updateRoleDto);
    return new RoleResponseDto(role);
  }
}
