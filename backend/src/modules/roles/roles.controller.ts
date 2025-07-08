import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam, 
  ApiForbiddenResponse
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Role as RoleEnum } from '../../common/enums/role.enum';
import { Permission } from '../../common/enums/permission.enum';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully.', type: Role })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 409, description: 'Conflict. Role with this name already exists.' })
  @Roles(RoleEnum.SUPERADMIN)
  @RequirePermissions(Permission.ROLE_CREATE, Permission.SUPERADMIN_MANAGE_ALL)
  create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.create(createRoleDto);

  }
  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of all roles.', type: [Role] })
  @RequirePermissions(Permission.ROLE_READ, Permission.SUPERADMIN_MANAGE_ALL)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERADMIN)
  @ApiForbiddenResponse({ description: 'Forbidden: Only admin or superadmin can access' })
  findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiResponse({ status: 200, description: 'Role found.', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @RequirePermissions(Permission.ROLE_READ, Permission.SUPERADMIN_MANAGE_ALL)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Role> {
    return this.rolesService.findOne(id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get a role by name' })
  @ApiParam({ name: 'name', description: 'Role name' })
  @ApiResponse({ status: 200, description: 'Role found.', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @RequirePermissions(Permission.ROLE_READ, Permission.SUPERADMIN_MANAGE_ALL)
  findByName(@Param('name') name: string): Promise<Role> {
    return this.rolesService.findByName(name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully.', type: Role })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Role not found.' }) 
  @ApiResponse({ status: 409, description: 'Conflict. Role with this name already exists.' })
  @Roles(RoleEnum.SUPERADMIN)
  @RequirePermissions(Permission.ROLE_UPDATE, Permission.SUPERADMIN_MANAGE_ALL)
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateRoleDto: UpdateRoleDto
  ): Promise<Role> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @Roles(RoleEnum.SUPERADMIN)
  @RequirePermissions(Permission.ROLE_DELETE, Permission.SUPERADMIN_MANAGE_ALL)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.rolesService.remove(id);
  }

  @Post(':roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Add permission to role' })
  @ApiParam({ name: 'roleId', description: 'Role UUID' })
  @ApiParam({ name: 'permissionId', description: 'Permission UUID' })
  @ApiResponse({ status: 200, description: 'Permission added to role successfully.', type: Role })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Role or permission not found.' })
  @Roles(RoleEnum.SUPERADMIN)
  @RequirePermissions(Permission.ROLE_UPDATE, Permission.SUPERADMIN_MANAGE_ALL)
  addPermissionToRole(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string
  ): Promise<Role> {
    return this.rolesService.addPermissionToRole(roleId, permissionId);
  }

  @Delete(':roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove permission from role' })
  @ApiParam({ name: 'roleId', description: 'Role UUID' })
  @ApiParam({ name: 'permissionId', description: 'Permission UUID' })
  @ApiResponse({ status: 200, description: 'Permission removed from role successfully.', type: Role })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @Roles(RoleEnum.SUPERADMIN)
  @RequirePermissions(Permission.ROLE_UPDATE, Permission.SUPERADMIN_MANAGE_ALL)
  removePermissionFromRole(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string
  ): Promise<Role> {
    return this.rolesService.removePermissionFromRole(roleId, permissionId);
  }
}
